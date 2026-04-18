import { describe, it, expect } from "vitest";
import { isUrlSafe, isLfiAttempt, assertUrlSafe, sanitizeUrl } from "./security";

describe("SSRF Prevention — isUrlSafe", () => {
  describe("blocked — loopback", () => {
    it("blocks 127.0.0.1", () => {
      expect(isUrlSafe("http://127.0.0.1/admin").safe).toBe(false);
    });
    it("blocks 127.255.255.255", () => {
      expect(isUrlSafe("http://127.255.255.255/").safe).toBe(false);
    });
    it("blocks localhost", () => {
      expect(isUrlSafe("http://localhost/api").safe).toBe(false);
    });
    it("blocks LOCALHOST uppercase", () => {
      expect(isUrlSafe("http://LOCALHOST/").safe).toBe(false);
    });
    it("blocks ::1 IPv6", () => {
      expect(isUrlSafe("http://[::1]/").safe).toBe(false);
    });
    it("blocks ::1 with path", () => {
      expect(isUrlSafe("http://[::1]:8080/admin").safe).toBe(false);
    });
  });

  describe("blocked — private IP ranges", () => {
    it("blocks 10.x.x.x (Class A private)", () => {
      expect(isUrlSafe("http://10.0.0.1/").safe).toBe(false);
      expect(isUrlSafe("http://10.255.255.255/").safe).toBe(false);
    });
    it("blocks 172.16.x.x – 172.31.x.x (Class B private)", () => {
      expect(isUrlSafe("http://172.16.0.1/").safe).toBe(false);
      expect(isUrlSafe("http://172.31.255.255/").safe).toBe(false);
      expect(isUrlSafe("http://172.20.0.1/").safe).toBe(false);
    });
    it("blocks 192.168.x.x (Class C private)", () => {
      expect(isUrlSafe("http://192.168.0.1/").safe).toBe(false);
      expect(isUrlSafe("http://192.168.255.255/").safe).toBe(false);
    });
  });

  describe("blocked — link-local / metadata endpoints", () => {
    it("blocks 169.254.169.254 (AWS metadata)", () => {
      expect(isUrlSafe("http://169.254.169.254/latest/meta-data/").safe).toBe(false);
      expect(isUrlSafe("https://169.254.169.254/").safe).toBe(false);
    });
    it("blocks 169.254.0.0/16 range", () => {
      expect(isUrlSafe("http://169.254.1.1/").safe).toBe(false);
      expect(isUrlSafe("http://169.254.255.254/").safe).toBe(false);
    });
    it("blocks metadata.google.internal", () => {
      expect(isUrlSafe("http://metadata.google.internal/").safe).toBe(false);
    });
    it("blocks kubernetes.default", () => {
      expect(isUrlSafe("http://kubernetes.default/svc").safe).toBe(false);
    });
  });

  describe("blocked — hostname patterns", () => {
    it("blocks *.local", () => {
      expect(isUrlSafe("http://server.local/api").safe).toBe(false);
      expect(isUrlSafe("http://intranet.local/").safe).toBe(false);
    });
    it("blocks *.internal", () => {
      expect(isUrlSafe("http://something.internal/").safe).toBe(false);
      expect(isUrlSafe("http://myapp.internal:8080/").safe).toBe(false);
    });
    it("blocks *.corp", () => {
      expect(isUrlSafe("http://server.corp/").safe).toBe(false);
      expect(isUrlSafe("http://something.corp/").safe).toBe(false);
    });
    it("blocks docker-* hostnames", () => {
      expect(isUrlSafe("http://docker-host:2375/").safe).toBe(false);
    });
    it("blocks k8s-* hostnames", () => {
      expect(isUrlSafe("http://k8s-master/api").safe).toBe(false);
    });
    it("blocks minikube", () => {
      expect(isUrlSafe("http://minikube/api").safe).toBe(false);
    });
    it("blocks ip6-* hostnames", () => {
      expect(isUrlSafe("http://ip6-localhost/").safe).toBe(false);
    });
  });

  describe("blocked — non-HTTP protocols", () => {
    it("blocks file://", () => {
      expect(isUrlSafe("file:///etc/passwd").safe).toBe(false);
    });
    it("blocks ftp://", () => {
      expect(isUrlSafe("ftp://ftp.example.com/file").safe).toBe(false);
    });
    it("blocks gopher://", () => {
      expect(isUrlSafe("gopher://example.com/").safe).toBe(false);
    });
    it("blocks data://", () => {
      expect(isUrlSafe("data:text/html,<script>alert(1)</script>").safe).toBe(false);
    });
    it("blocks javascript://", () => {
      expect(isUrlSafe("javascript:void(0)").safe).toBe(false);
    });
  });

  describe("blocked — embedded credentials", () => {
    it("blocks username@privateIP", () => {
      expect(isUrlSafe("http://user@127.0.0.1/admin").safe).toBe(false);
    });
    it("blocks username@localhost", () => {
      expect(isUrlSafe("http://user@localhost/admin").safe).toBe(false);
    });
    it("blocks URL with password", () => {
      expect(isUrlSafe("http://user:pass@localhost/").safe).toBe(false);
    });
  });

  describe("blocked — invalid URLs", () => {
    it("returns false for unparseable strings", () => {
      expect(isUrlSafe("not-a-url").safe).toBe(false);
      expect(isUrlSafe("://").safe).toBe(false);
    });
  });

  describe("allowed — public URLs", () => {
    it("allows public HTTPS URLs", () => {
      expect(isUrlSafe("https://example.com/docs").safe).toBe(true);
      expect(isUrlSafe("https://api.github.com/users").safe).toBe(true);
      expect(isUrlSafe("https://www.wikipedia.org/").safe).toBe(true);
    });
    it("allows public HTTP URLs", () => {
      expect(isUrlSafe("http://example.com/").safe).toBe(true);
    });
    it("allows URLs with common non-standard ports", () => {
      expect(isUrlSafe("https://example.com:8443/api").safe).toBe(true);
      expect(isUrlSafe("http://example.com:3000/").safe).toBe(true);
    });
    it("allows redirect chains to public domains", () => {
      expect(isUrlSafe("https://safe.redirect.com/api").safe).toBe(true);
    });
    it("allows known public IPs (Google DNS, Cloudflare)", () => {
      expect(isUrlSafe("https://8.8.8.8/dns-query").safe).toBe(true);
      expect(isUrlSafe("https://1.1.1.1/").safe).toBe(true);
    });
    it("allows URLs with query strings and hashes", () => {
      expect(isUrlSafe("https://example.com/page?id=1#section").safe).toBe(true);
    });
  });
});

describe("LFI Prevention — isLfiAttempt", () => {
  it("blocks file:// protocol", () => {
    expect(isLfiAttempt("file:///etc/passwd")).toBe(true);
    expect(isLfiAttempt("file://C:\\Windows\\System32\\config\\sam")).toBe(true);
  });
  it("blocks Windows UNC paths", () => {
    expect(isLfiAttempt("\\\\server\\share\\file")).toBe(true);
  });
  it("blocks Unix sensitive paths", () => {
    expect(isLfiAttempt("/etc/passwd")).toBe(true);
    expect(isLfiAttempt("/etc/shadow")).toBe(true);
    expect(isLfiAttempt("/proc/self/environ")).toBe(true);
    expect(isLfiAttempt("/var/log/syslog")).toBe(true);
    expect(isLfiAttempt("/root/.ssh/authorized_keys")).toBe(true);
  });
  it("blocks Windows sensitive paths", () => {
    expect(isLfiAttempt("C:\\Windows\\System32\\config\\SAM")).toBe(true);
    expect(isLfiAttempt("c:\\windows\\system32\\drivers\\etc\\hosts")).toBe(true);
  });
  it("allows safe strings", () => {
    expect(isLfiAttempt("https://example.com")).toBe(false);
    expect(isLfiAttempt("/blog/my-post")).toBe(false);
    expect(isLfiAttempt("relative-path/to/file")).toBe(false);
  });
});

describe("assertUrlSafe", () => {
  it("does not throw for safe URLs", () => {
    expect(() => assertUrlSafe("https://example.com")).not.toThrow();
  });
  it("throws SSRF_BLOCKED for unsafe URLs", () => {
    expect(() => assertUrlSafe("http://127.0.0.1/admin")).toThrow("SSRF_BLOCKED");
    expect(() => assertUrlSafe("http://169.254.169.254/")).toThrow("SSRF_BLOCKED");
    expect(() => assertUrlSafe("file:///etc/passwd")).toThrow("SSRF_BLOCKED");
  });
});

describe("sanitizeUrl", () => {
  it("strips username and password", () => {
    expect(sanitizeUrl("http://user:pass@example.com/path")).toBe("http://example.com/path");
  });
  it("strips hash", () => {
    expect(sanitizeUrl("https://example.com/page#section")).toBe("https://example.com/page");
  });
  it("keeps query string", () => {
    expect(sanitizeUrl("https://example.com/search?q=test")).toBe("https://example.com/search?q=test");
  });
  it("keeps port", () => {
    expect(sanitizeUrl("https://example.com:8443/api")).toBe("https://example.com:8443/api");
  });
});
