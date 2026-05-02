# Báo Cáo Kiểm Tra Hàng Loạt — 100 URL US

**Ngày kiểm tra:** lúc 10:24 10 tháng 4, 2026  
**Tổng thời gian:** 38.6s (~1249ms/URL)

---

## 1. Tóm Tắt Điều Hành

| Nhóm | Số lượng | Tỷ lệ |
| :--- | ---: | ---: |
| Nhóm 1 — Không thể phân tích (fatal) | **89** | 89.0% |
| Nhóm 2 — Có lỗi validation | **1** | 1.0% |
| Nhóm 3 — Chỉ cảnh báo | **8** | 8.0% |
| Nhóm 4 — Hợp lệ hoàn toàn | **2** | 2.0% |

| **Tổng cộng** | **100** | **100%** |

---

## 2. Nhóm 1 — Không Thể Phân Tích (89 sites)

**Nguyên nhân:** Tool không thể fetch hoặc parse file /llms.txt. Không có file, server lỗi, bị chặn, hoặc trả về HTML/WAF.

| # | Công ty | Mã lỗi | Mô tả | Link /llms.txt |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Walmart | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.walmart.com/llms.txt` |
| 2 | Amazon | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.amazon.com/llms.txt` |
| 3 | Costco | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.costco.com/llms.txt` |
| 4 | The Home Depot | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.homedepot.com/llms.txt` |
| 5 | Kroger | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.kroger.com/llms.txt` |
| 7 | Walgreens | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.walgreens.com/llms.txt` |
| 8 | CVS Health | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.cvshealth.com/llms.txt` |
| 9 | TJX Companies | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.tjx.com/llms.txt` |
| 10 | eBay | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.ebay.com/llms.txt` |
| 11 | Apple | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.apple.com/llms.txt` |
| 12 | Microsoft | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.microsoft.com/llms.txt` |
| 13 | Alphabet (Google) | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://abc.xyz/llms.txt` |
| 14 | Meta Platforms | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.meta.com/llms.txt` |
| 16 | IBM | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.ibm.com/llms.txt` |
| 17 | Intel | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.intel.com/llms.txt` |
| 20 | Oracle | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.oracle.com/llms.txt` |
| 22 | HP Inc. | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.hp.com/llms.txt` |
| 23 | Qualcomm | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.qualcomm.com/llms.txt` |
| 25 | ServiceNow | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.servicenow.com/llms.txt` |
| 26 | JPMorgan Chase | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.jpmorganchase.com/llms.txt` |
| 27 | Bank of America | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.bankofamerica.com/llms.txt` |
| 28 | Wells Fargo | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.wellsfargo.com/llms.txt` |
| 29 | Citigroup | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.citigroup.com/llms.txt` |
| 30 | Goldman Sachs | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.goldmansachs.com/llms.txt` |
| 31 | Morgan Stanley | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.morganstanley.com/llms.txt` |
| 32 | American Express | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.americanexpress.com/llms.txt` |
| 33 | Visa | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.visa.com/llms.txt` |
| 34 | Mastercard | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.mastercard.com/llms.txt` |
| 35 | BlackRock | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.blackrock.com/llms.txt` |
| 36 | Berkshire Hathaway | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.berkshirehathaway.com/llms.txt` |
| 37 | State Farm | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.statefarm.com/llms.txt` |
| 38 | UnitedHealth Group | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.unitedhealthgroup.com/llms.txt` |
| 39 | McKesson | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.mckesson.com/llms.txt` |
| 40 | Cardinal Health | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.cardinalhealth.com/llms.txt` |
| 42 | Elevance Health | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.elevancehealth.com/llms.txt` |
| 43 | Humana | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.humana.com/llms.txt` |
| 44 | Centene | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.centene.com/llms.txt` |
| 45 | Johnson \& Johnson | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.jnj.com/llms.txt` |
| 46 | ExxonMobil | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.exxonmobil.com/llms.txt` |
| 47 | Chevron | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.chevron.com/llms.txt` |
| 48 | Marathon Petroleum | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.marathonpetroleum.com/llms.txt` |
| 49 | Phillips 66 | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.phillips66.com/llms.txt` |
| 50 | Valero Energy | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.valero.com/llms.txt` |
| 51 | ConocoPhillips | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.conocophillips.com/llms.txt` |
| 52 | Energy Transfer | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.energytransfer.com/llms.txt` |
| 54 | Ford Motor Company | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.ford.com/llms.txt` |
| 56 | Tesla | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.tesla.com/llms.txt` |
| 57 | Caterpillar | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.caterpillar.com/llms.txt` |
| 58 | General Electric | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.ge.com/llms.txt` |
| 60 | Honeywell | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.honeywell.com/llms.txt` |
| 61 | Boeing | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.boeing.com/llms.txt` |
| 62 | AT\&T | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.att.com/llms.txt` |
| 64 | Comcast | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://corporate.comcast.com/llms.txt` |
| 65 | T-Mobile | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.t-mobile.com/llms.txt` |
| 66 | The Walt Disney Company | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://thewaltdisneycompany.com/llms.txt` |
| 67 | Netflix | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://ir.netflix.net/llms.txt` |
| 68 | Warner Bros. Discovery | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://wbd.com/llms.txt` |
| 69 | FedEx | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.fedex.com/llms.txt` |
| 70 | UPS | `timeout` | Server không phản hồi sau 10 giây | `https://www.ups.com/llms.txt` |
| 71 | American Airlines | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.aa.com/llms.txt` |
| 72 | Delta Air Lines | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.delta.com/llms.txt` |
| 73 | United Airlines | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.united.com/llms.txt` |
| 74 | Southwest Airlines | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.southwest.com/llms.txt` |
| 75 | Raytheon Technologies | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.rtx.com/llms.txt` |
| 76 | PepsiCo | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.pepsico.com/llms.txt` |
| 77 | Coca-Cola | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.coca-colacompany.com/llms.txt` |
| 78 | McDonald's | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://corporate.mcdonalds.com/llms.txt` |
| 79 | Starbucks | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.starbucks.com/llms.txt` |
| 80 | Archer Daniels Midland | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.adm.com/llms.txt` |
| 81 | Tyson Foods | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.tysonfoods.com/llms.txt` |
| 82 | Kraft Heinz | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.kraftheinzcompany.com/llms.txt` |
| 83 | Mondelez International | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.mondelezinternational.com/llms.txt` |
| 84 | CBRE Group | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.cbre.com/llms.txt` |
| 85 | Prologis | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.prologis.com/llms.txt` |
| 86 | Simon Property Group | `http_error` | Server trả về HTTP không thành công | `https://www.simon.com/llms.txt` |
| 87 | D.R. Horton | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.drhorton.com/llms.txt` |
| 88 | Lennar Corporation | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.lennar.com/llms.txt` |
| 89 | Procter \& Gamble | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://us.pg.com/llms.txt` |
| 90 | Pfizer | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.pfizer.com/llms.txt` |
| 91 | AbbVie | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.abbvie.com/llms.txt` |
| 92 | Merck \& Co. | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.merck.com/llms.txt` |
| 93 | Eli Lilly | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.lilly.com/llms.txt` |
| 94 | Abbott Laboratories | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.abbott.com/llms.txt` |
| 95 | Bristol-Myers Squibb | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.bms.com/llms.txt` |
| 96 | Deloitte | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www2.deloitte.com/llms.txt` |
| 97 | Accenture | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.accenture.com/llms.txt` |
| 98 | McKinsey \& Company | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.mckinsey.com/llms.txt` |
| 99 | Lockheed Martin | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.lockheedmartin.com/llms.txt` |
| 100 | Northrop Grumman | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.northropgrumman.com/llms.txt` |

---

## 3. Nhóm 2 — Có Lỗi Validation (1 sites)

**Nguyên nhân:** File /ll.txt tồn tại và có thể đọc, nhưng không đạt ít nhất 1 trong 2 yêu cầu bắt buộc: thiếu H1 title hoặc file rỗng/không đọc được.

| # | Công ty | H1 Title | Lỗi |
| :--- | :--- | :--- | :--- |
| 19 | Salesforce | — | Missing H1 title (# Title) |

---

## 4. Nhóm 3 — Chỉ Cảnh Báo (8 sites)

**Nguyên nhân:** File /llms.txt hợp lệ nhưng thiếu một số phần không bắt buộc (blockquote, mô tả chi tiết, project details, format links, hoặc có broken links).

| # | Công ty | H1 Title | Links | Cảnh báo |
| :--- | :--- | :--- | ---: | :--- |
| 6 | Target | Target.com | 54 | Description Paragraphs |
| 18 | Nvidia | NVIDIA Corporation | 19 | Description Paragraphs |
| 21 | Cisco Systems | Cisco.com Priority Pages for Data Center | 5 | Brief Description (blockquote), Description Paragraphs, Link Validation |
| 41 | Cigna | llms.txt — cigna.com | 0 | Description Paragraphs |
| 53 | Halliburton | Halliburton | 23 | Description Paragraphs |
| 55 | General Motors | test | 0 | Brief Description (blockquote), Description Paragraphs, Project Details |
| 59 | 3M | www.3m.com llms.txt | 31 | Link Validation |
| 63 | Verizon | Verizon | 41 | Link Validation |

---

## 4. Nhóm 4 — Hợp Lệ Hoàn Toàn (2 sites)

| # | Công ty | H1 Title | Links |
| :--- | :--- | :--- | ---: |
| 15 | Dell Technologies | Dell Technologies | 131 |
| 24 | Adobe | Adobe Tools | 46 |

---

## 5. Phân Bố Mã Lỗi (89 sites fatal)

| Mã lỗi | Số lượng | Tỷ lệ | Mô tả |
| :--- | ---: | ---: | :--- |
| `not_found` | **69** | 77.5% | File /llms.txt không tồn tại (HTTP 404) |
| `access_denied` | **16** | 18.0% | Truy cập bị từ chối (HTTP 401/403) |
| `not_llms_txt` | **2** | 2.2% | Server trả về HTML/WAF thay vì file văn bản |
| `timeout` | **1** | 1.1% | Server không phản hồi sau 10 giây |
| `http_error` | **1** | 1.1% | Server trả về HTTP không thành công |

---

## 6. Phân Bố Cảnh Báo

| Cảnh báo | Số site | Tỷ lệ (/11 site có llms.txt) |
| :--- | ---: | ---: |
| Description Paragraphs (`description_paragraphs`) | **7** | 63.6% |
| Brief Description (blockquote) (`quote_block`) | **3** | 27.3% |
| Link Validation (`link_validation`) | **3** | 27.3% |
| Project Details (`project_details`) | **1** | 9.1% |

---

## 7. Broken Links

| # | Công ty | Số broken | Chi tiết |
| :--- | :--- | ---: | :--- |
| 63 | Verizon | 6 | https://www.verizon.com/smartphones/ (HTTP 417); https://www.verizon.com/business/products/devices-services/wireless/ (HTTP 404); https://www.verizon.com/business/products/internet-tv-voice/internet/ (HTTP 404); https://www.verizon.com/business/products/security-compliance/cyber-security-services/ (HTTP 404); https://www.verizon.com/business/products/iot-solutions/ (HTTP 404); https://www.verizon.com/about/careers (HTTP 403) |
| 21 | Cisco Systems | 5 | https://www.cisco.com/site/us/en/products/networking/cloud-networking/application-centric-infrastructure/index.html.md (HTTP 404); https://www.cisco.com/site/us/en/products/networking/cloud-networking/nexus-platform/index.html.md (HTTP 404); https://www.cisco.com/site/us/en/products/computing/hybrid-cloud-operations/intersight-platform/index.html.md (HTTP 404); https://www.cisco.com/site/us/en/products/networking/data-center-networking/nexus-hyperfabric/hyperfabric-ai/index.html.md (HTTP 404); https://www.cisco.com/site/us/en/products/computing/hyperconverged/nutanix/index.html.md (HTTP 404) |
| 59 | 3M | 1 | https://www.3m.com/my3M/en_US/company-us (HTTP 0) |

---

## 8. Bảng Chi Tiết Tất Cả 100 Sites

> **Ghi chú:** Nhóm 1 = không thể phân tích | Nhóm 2 = có lỗi | Nhóm 3 = chỉ cảnh báo | Nhóm 4 = hợp lệ

| # | Công ty | Nhóm | Mã lỗi / Trạng thái | H1 Title | Errors | Warnings | Links | Broken | Duration |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 1 | Walmart | 1-Fatal | `not_found` | — | — | — | 0 | — | 591ms |
| 2 | Amazon | 1-Fatal | `not_found` | — | — | — | 0 | — | 328ms |
| 3 | Costco | 1-Fatal | `access_denied` | — | — | — | 0 | — | 162ms |
| 4 | The Home Depot | 1-Fatal | `access_denied` | — | — | — | 0 | — | 174ms |
| 5 | Kroger | 1-Fatal | `access_denied` | — | — | — | 0 | — | 127ms |
| 6 | Target | 3-Warn | — | Target.com | — | 1 | 54 | — | 2826ms |
| 7 | Walgreens | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 1452ms |
| 8 | CVS Health | 1-Fatal | `access_denied` | — | — | — | 0 | — | 547ms |
| 9 | TJX Companies | 1-Fatal | `not_found` | — | — | — | 0 | — | 1267ms |
| 10 | eBay | 1-Fatal | `not_found` | — | — | — | 0 | — | 1106ms |
| 11 | Apple | 1-Fatal | `not_found` | — | — | — | 0 | — | 416ms |
| 12 | Microsoft | 1-Fatal | `not_found` | — | — | — | 0 | — | 423ms |
| 13 | Alphabet (Google) | 1-Fatal | `not_found` | — | — | — | 0 | — | 459ms |
| 14 | Meta Platforms | 1-Fatal | `not_found` | — | — | — | 0 | — | 637ms |
| 15 | Dell Technologies | 4-OK | — | Dell Technologies | — | — | 131 | — | 2067ms |
| 16 | IBM | 1-Fatal | `not_found` | — | — | — | 0 | — | 350ms |
| 17 | Intel | 1-Fatal | `not_found` | — | — | — | 0 | — | 1228ms |
| 18 | Nvidia | 3-Warn | — | NVIDIA Corporation | — | 1 | 19 | — | 4460ms |
| 19 | Salesforce | 2-Err | — | — | 1 | 2 | 3749 | — | 2471ms |
| 20 | Oracle | 1-Fatal | `not_found` | — | — | — | 0 | — | 339ms |
| 21 | Cisco Systems | 3-Warn | — | Cisco.com Priority Pages for Data Center | — | 7 | 5 | **5** | 503ms |
| 22 | HP Inc. | 1-Fatal | `not_found` | — | — | — | 0 | — | 90ms |
| 23 | Qualcomm | 1-Fatal | `not_found` | — | — | — | 0 | — | 878ms |
| 24 | Adobe | 4-OK | — | Adobe Tools | — | — | 46 | — | 2331ms |
| 25 | ServiceNow | 1-Fatal | `not_found` | — | — | — | 0 | — | 1043ms |
| 26 | JPMorgan Chase | 1-Fatal | `not_found` | — | — | — | 0 | — | 1465ms |
| 27 | Bank of America | 1-Fatal | `not_found` | — | — | — | 0 | — | 1868ms |
| 28 | Wells Fargo | 1-Fatal | `not_found` | — | — | — | 0 | — | 1148ms |
| 29 | Citigroup | 1-Fatal | `not_found` | — | — | — | 0 | — | 1764ms |
| 30 | Goldman Sachs | 1-Fatal | `not_found` | — | — | — | 0 | — | 3084ms |
| 31 | Morgan Stanley | 1-Fatal | `not_found` | — | — | — | 0 | — | 642ms |
| 32 | American Express | 1-Fatal | `not_found` | — | — | — | 0 | — | 1607ms |
| 33 | Visa | 1-Fatal | `not_found` | — | — | — | 0 | — | 451ms |
| 34 | Mastercard | 1-Fatal | `not_found` | — | — | — | 0 | — | 737ms |
| 35 | BlackRock | 1-Fatal | `not_found` | — | — | — | 0 | — | 751ms |
| 36 | Berkshire Hathaway | 1-Fatal | `not_found` | — | — | — | 0 | — | 816ms |
| 37 | State Farm | 1-Fatal | `not_found` | — | — | — | 0 | — | 853ms |
| 38 | UnitedHealth Group | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 3174ms |
| 39 | McKesson | 1-Fatal | `not_found` | — | — | — | 0 | — | 1066ms |
| 40 | Cardinal Health | 1-Fatal | `not_found` | — | — | — | 0 | — | 749ms |
| 41 | Cigna | 3-Warn | — | llms.txt — cigna.com | — | 1 | 0 | — | 1745ms |
| 42 | Elevance Health | 1-Fatal | `not_found` | — | — | — | 0 | — | 1853ms |
| 43 | Humana | 1-Fatal | `access_denied` | — | — | — | 0 | — | 962ms |
| 44 | Centene | 1-Fatal | `not_found` | — | — | — | 0 | — | 1082ms |
| 45 | Johnson \& Johnson | 1-Fatal | `not_found` | — | — | — | 0 | — | 1246ms |
| 46 | ExxonMobil | 1-Fatal | `not_found` | — | — | — | 0 | — | 1622ms |
| 47 | Chevron | 1-Fatal | `access_denied` | — | — | — | 0 | — | 3403ms |
| 48 | Marathon Petroleum | 1-Fatal | `access_denied` | — | — | — | 0 | — | 907ms |
| 49 | Phillips 66 | 1-Fatal | `not_found` | — | — | — | 0 | — | 3351ms |
| 50 | Valero Energy | 1-Fatal | `not_found` | — | — | — | 0 | — | 1412ms |
| 51 | ConocoPhillips | 1-Fatal | `not_found` | — | — | — | 0 | — | 740ms |
| 52 | Energy Transfer | 1-Fatal | `access_denied` | — | — | — | 0 | — | 145ms |
| 53 | Halliburton | 3-Warn | — | Halliburton | — | 1 | 23 | — | 2319ms |
| 54 | Ford Motor Company | 1-Fatal | `not_found` | — | — | — | 0 | — | 1432ms |
| 55 | General Motors | 3-Warn | — | test | — | 3 | 0 | — | 384ms |
| 56 | Tesla | 1-Fatal | `not_found` | — | — | — | 0 | — | 667ms |
| 57 | Caterpillar | 1-Fatal | `not_found` | — | — | — | 0 | — | 901ms |
| 58 | General Electric | 1-Fatal | `not_found` | — | — | — | 0 | — | 972ms |
| 59 | 3M | 3-Warn | — | www.3m.com llms.txt | — | 1 | 31 | **1** | 5903ms |
| 60 | Honeywell | 1-Fatal | `not_found` | — | — | — | 0 | — | 998ms |
| 61 | Boeing | 1-Fatal | `not_found` | — | — | — | 0 | — | 567ms |
| 62 | AT\&T | 1-Fatal | `access_denied` | — | — | — | 0 | — | 125ms |
| 63 | Verizon | 3-Warn | — | Verizon | — | 6 | 41 | **6** | 3342ms |
| 64 | Comcast | 1-Fatal | `not_found` | — | — | — | 0 | — | 952ms |
| 65 | T-Mobile | 1-Fatal | `access_denied` | — | — | — | 0 | — | 208ms |
| 66 | The Walt Disney Company | 1-Fatal | `not_found` | — | — | — | 0 | — | 987ms |
| 67 | Netflix | 1-Fatal | `not_found` | — | — | — | 0 | — | 4022ms |
| 68 | Warner Bros. Discovery | 1-Fatal | `access_denied` | — | — | — | 0 | — | 1208ms |
| 69 | FedEx | 1-Fatal | `not_found` | — | — | — | 0 | — | 906ms |
| 70 | UPS | 1-Fatal | `timeout` | — | — | — | 0 | — | 10004ms |
| 71 | American Airlines | 1-Fatal | `not_found` | — | — | — | 0 | — | 2135ms |
| 72 | Delta Air Lines | 1-Fatal | `not_found` | — | — | — | 0 | — | 643ms |
| 73 | United Airlines | 1-Fatal | `not_found` | — | — | — | 0 | — | 759ms |
| 74 | Southwest Airlines | 1-Fatal | `not_found` | — | — | — | 0 | — | 1195ms |
| 75 | Raytheon Technologies | 1-Fatal | `not_found` | — | — | — | 0 | — | 1105ms |
| 76 | PepsiCo | 1-Fatal | `access_denied` | — | — | — | 0 | — | 176ms |
| 77 | Coca-Cola | 1-Fatal | `not_found` | — | — | — | 0 | — | 1182ms |
| 78 | McDonald's | 1-Fatal | `not_found` | — | — | — | 0 | — | 594ms |
| 79 | Starbucks | 1-Fatal | `not_found` | — | — | — | 0 | — | 555ms |
| 80 | Archer Daniels Midland | 1-Fatal | `not_found` | — | — | — | 0 | — | 2093ms |
| 81 | Tyson Foods | 1-Fatal | `not_found` | — | — | — | 0 | — | 771ms |
| 82 | Kraft Heinz | 1-Fatal | `not_found` | — | — | — | 0 | — | 520ms |
| 83 | Mondelez International | 1-Fatal | `not_found` | — | — | — | 0 | — | 2669ms |
| 84 | CBRE Group | 1-Fatal | `access_denied` | — | — | — | 0 | — | 279ms |
| 85 | Prologis | 1-Fatal | `not_found` | — | — | — | 0 | — | 434ms |
| 86 | Simon Property Group | 1-Fatal | `http_error` | — | — | — | 0 | — | 497ms |
| 87 | D.R. Horton | 1-Fatal | `access_denied` | — | — | — | 0 | — | 318ms |
| 88 | Lennar Corporation | 1-Fatal | `access_denied` | — | — | — | 0 | — | 273ms |
| 89 | Procter \& Gamble | 1-Fatal | `not_found` | — | — | — | 0 | — | 2243ms |
| 90 | Pfizer | 1-Fatal | `not_found` | — | — | — | 0 | — | 389ms |
| 91 | AbbVie | 1-Fatal | `access_denied` | — | — | — | 0 | — | 120ms |
| 92 | Merck \& Co. | 1-Fatal | `not_found` | — | — | — | 0 | — | 678ms |
| 93 | Eli Lilly | 1-Fatal | `not_found` | — | — | — | 0 | — | 180ms |
| 94 | Abbott Laboratories | 1-Fatal | `not_found` | — | — | — | 0 | — | 477ms |
| 95 | Bristol-Myers Squibb | 1-Fatal | `not_found` | — | — | — | 0 | — | 636ms |
| 96 | Deloitte | 1-Fatal | `not_found` | — | — | — | 0 | — | 430ms |
| 97 | Accenture | 1-Fatal | `not_found` | — | — | — | 0 | — | 300ms |
| 98 | McKinsey \& Company | 1-Fatal | `not_found` | — | — | — | 0 | — | 833ms |
| 99 | Lockheed Martin | 1-Fatal | `not_found` | — | — | — | 0 | — | 867ms |
| 100 | Northrop Grumman | 1-Fatal | `not_found` | — | — | — | 0 | — | 777ms |
