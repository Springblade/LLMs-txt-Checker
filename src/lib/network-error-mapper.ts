export interface NetworkErrorInfo {
  errorCode: string;
  displayMessage: string;
  isInfrastructureError: boolean;
}

const NODE_ERROR_PATTERNS: Array<{
  pattern: (msg: string) => boolean;
  errorCode: string;
  displayMessage: string;
}> = [
  {
    pattern: (msg) =>
      /certificate has expired|ssl|cert_has_expired|tls|ssl_cert/i.test(msg),
    errorCode: "ssl_error",
    displayMessage:
      "Invalid SSL Certificate — the website's security certificate has expired",
  },
  {
    pattern: (msg) =>
      /too many redirects|redirect loop|ERR_TOO_MANY_REDIRECTS/i.test(msg),
    errorCode: "redirect_loop",
    displayMessage:
      "Multiple Redirect Loop Detected — the server is redirecting infinitely",
  },
  {
    pattern: (msg) =>
      /ECONNREFUSED|connection refused|ECONNRESET|connection reset/i.test(msg),
    errorCode: "connection_error",
    displayMessage:
      "Cannot access website — server refused the connection",
  },
  {
    pattern: (msg) =>
      /ENOTFOUND|dns|getaddrinfo|hostname|does not exist/i.test(msg),
    errorCode: "dns_error",
    displayMessage: "DNS Error — the website domain could not be resolved",
  },
  {
    pattern: (msg) =>
      /403|forbidden|blocked|geo|geoblock|blocked by|country/i.test(msg),
    errorCode: "geo_blocked",
    displayMessage: "Server IP Geo-Blocked — access is restricted from your region",
  },
];

export function mapNetworkError(error: unknown): NetworkErrorInfo {
  const message = error instanceof Error ? error.message : String(error);
  const name = error instanceof Error ? error.name : "";

  if (name === "AbortError") {
    return {
      errorCode: "timeout",
      displayMessage: "Request timeout — the server took too long to respond",
      isInfrastructureError: true,
    };
  }

  for (const { pattern, errorCode, displayMessage } of NODE_ERROR_PATTERNS) {
    if (pattern(message)) {
      return {
        errorCode,
        displayMessage,
        isInfrastructureError: true,
      };
    }
  }

  return {
    errorCode: "connection_error",
    displayMessage: "Cannot access website — an unexpected network error occurred",
    isInfrastructureError: true,
  };
}