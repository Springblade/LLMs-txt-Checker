# Báo Cáo Kiểm Tra Hàng Loạt — 100 URL VN

**Ngày kiểm tra:** lúc 10:30 10 tháng 4, 2026  
**Tổng thời gian:** 51.6s (~1309ms/URL)

---

## 1. Tóm Tắt Điều Hành

| Nhóm | Số lượng | Tỷ lệ |
| :--- | ---: | ---: |
| Nhóm 1 — Không thể phân tích (fatal) | **96** | 96.0% |
| Nhóm 2 — Có lỗi validation | **2** | 2.0% |
| Nhóm 3 — Chỉ cảnh báo | **2** | 2.0% |
| Nhóm 4 — Hợp lệ hoàn toàn | **0** | 0.0% |

| **Tổng cộng** | **100** | **100%** |

---

## 2. Nhóm 1 — Không Thể Phân Tích (96 sites)

**Nguyên nhân:** Tool không thể fetch hoặc parse file /llms.txt. Không có file, server lỗi, bị chặn, hoặc trả về HTML/WAF.

| # | Công ty | Mã lỗi | Mô tả | Link /llms.txt |
| :--- | :--- | :--- | :--- | :--- |
| 1 | Vietcombank | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.vietcombank.com.vn/llms.txt` |
| 2 | VietinBank | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.vietinbank.vn/llms.txt` |
| 3 | BIDV | `connection_error` | Không thể kết nối đến server (bị chặn IP nước ngoài?) | `https://www.bidv.com.vn/llms.txt` |
| 4 | Agribank | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.agribank.com.vn/llms.txt` |
| 5 | Techcombank | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.techcombank.com.vn/llms.txt` |
| 6 | MB Bank | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.mbbank.com.vn/llms.txt` |
| 7 | VPBank | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.vpbank.com.vn/llms.txt` |
| 8 | ACB | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.acb.com.vn/llms.txt` |
| 9 | HDBank | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.hdbank.com.vn/llms.txt` |
| 10 | SHB | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.shb.com.vn/llms.txt` |
| 11 | Sacombank | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.sacombank.com.vn/llms.txt` |
| 12 | TPBank | `timeout` | Server không phản hồi sau 10 giây | `https://www.tpbank.vn/llms.txt` |
| 13 | SeABank | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.seabank.com.vn/llms.txt` |
| 14 | BaoViet | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.baoviet.com.vn/llms.txt` |
| 15 | PetroVietnam (PVN) | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.pvn.vn/llms.txt` |
| 16 | PV GAS | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.pvgas.com.vn/llms.txt` |
| 17 | PVOil | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.pvoil.com.vn/llms.txt` |
| 18 | EVN | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.evn.com.vn/llms.txt` |
| 19 | EVNNPC | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.npc.com.vn/llms.txt` |
| 20 | EVNSPC | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.evnspc.vn/llms.txt` |
| 21 | BSR (Bình Sơn) | `connection_error` | Không thể kết nối đến server (bị chặn IP nước ngoài?) | `https://www.bsr.com.vn/llms.txt` |
| 22 | PV Power | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.pvpower.vn/llms.txt` |
| 23 | Viettel | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.viettel.vn/llms.txt` |
| 24 | VNPT | `connection_error` | Không thể kết nối đến server (bị chặn IP nước ngoài?) | `https://www.vnpt.vn/llms.txt` |
| 25 | MobiFone | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.mobifone.vn/llms.txt` |
| 27 | FPT Corporation | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://fpt.com.vn/llms.txt` |
| 28 | CMC Telecom | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://cmctelecom.vn/llms.txt` |
| 29 | BKAV | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.bkav.com.vn/llms.txt` |
| 30 | VNG Corporation | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.vng.com.vn/llms.txt` |
| 31 | Momo | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.momo.vn/llms.txt` |
| 32 | Zalo | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://zalo.me/llms.txt` |
| 33 | VCCorp | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://vccorp.vn/llms.txt` |
| 34 | Vietnix | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://vietnix.vn/llms.txt` |
| 35 | Vingroup | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.vingroup.net/llms.txt` |
| 36 | Novaland | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://novaland.com.vn/llms.txt` |
| 37 | Sungroup | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://sungroup.com.vn/llms.txt` |
| 38 | Hưng Thịnh Corp | `http_error` | Server trả về HTTP không thành công | `https://hungthinh.com/llms.txt` |
| 39 | Nam Long | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.namlonggroup.com/llms.txt` |
| 40 | Đất Xanh Group | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://datxanh.vn/llms.txt` |
| 41 | Khang Điền | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.khangdien.com.vn/llms.txt` |
| 42 | Becamex IDC | `connection_error` | Không thể kết nối đến server (bị chặn IP nước ngoài?) | `https://becamex.com.vn/llms.txt` |
| 43 | VNCC (Vinaconex) | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.vinaconex.com.vn/llms.txt` |
| 44 | Coteccons | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://coteccons.vn/llms.txt` |
| 45 | Hòa Phát Group | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.hoaphat.com.vn/llms.txt` |
| 46 | Tập đoàn Xây dựng Delta | `timeout` | Server không phản hồi sau 10 giây | `https://www.deltacorp.vn/llms.txt` |
| 47 | VinCommerce (WinMart) | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.winmart.vn/llms.txt` |
| 48 | Thế Giới Di Động | `server_error` | Server trả về lỗi 5xx | `https://www.thegioididong.com/llms.txt` |
| 49 | FPT Shop | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://fptshop.com.vn/llms.txt` |
| 50 | Bách Hóa Xanh | `server_error` | Server trả về lỗi 5xx | `https://www.bachhoaxanh.com/llms.txt` |
| 51 | Saigon Co.op | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.co-opmart.com.vn/llms.txt` |
| 52 | PNJ | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.pnj.com.vn/llms.txt` |
| 53 | DOJI Group | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://doji.vn/llms.txt` |
| 54 | Masan Group | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.masangroup.com/llms.txt` |
| 56 | TH True Milk | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.thmilk.vn/llms.txt` |
| 57 | Sabeco | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.sabeco.com.vn/llms.txt` |
| 58 | Habeco | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.habeco.com.vn/llms.txt` |
| 59 | Vietnam Airlines | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.vietnamairlines.com/llms.txt` |
| 60 | Vietjet Air | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.vietjetair.com/llms.txt` |
| 61 | Bamboo Airways | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.bambooairways.com/llms.txt` |
| 62 | VINALINES | `timeout` | Server không phản hồi sau 10 giây | `https://www.vinalines.com.vn/llms.txt` |
| 63 | Tổng cục Hàng hải (Vinamarine) | `timeout` | Server không phản hồi sau 10 giây | `https://www.vinamarine.gov.vn/llms.txt` |
| 64 | Vinafco | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://vinafco.com.vn/llms.txt` |
| 65 | Gemadept | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.gemadept.com.vn/llms.txt` |
| 66 | VinFast | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://vinfastauto.com/llms.txt` |
| 67 | THACO | `timeout` | Server không phản hồi sau 10 giây | `https://www.thaco.com.vn/llms.txt` |
| 68 | Vinamotor | `connection_error` | Không thể kết nối đến server (bị chặn IP nước ngoài?) | `https://www.vinamotor.com.vn/llms.txt` |
| 69 | Hòa Phát (Thép) | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://thep.hoaphat.com.vn/llms.txt` |
| 70 | Tôn Hoa Sen | `timeout` | Server không phản hồi sau 10 giây | `https://www.hoasengroup.vn/llms.txt` |
| 71 | Pomina Steel | `connection_error` | Không thể kết nối đến server (bị chặn IP nước ngoài?) | `https://www.pomina.com.vn/llms.txt` |
| 72 | Vinmec | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.vinmec.com/llms.txt` |
| 73 | FV Hospital | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.fvhospital.com/llms.txt` |
| 74 | Medlatec | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://medlatec.vn/llms.txt` |
| 75 | DHG Pharma | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.dhgpharma.com.vn/llms.txt` |
| 76 | Dược Hậu Giang | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.dhgpharma.com.vn/llms.txt` |
| 77 | Imexpharm | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.imexpharm.com/llms.txt` |
| 78 | VinSchool | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://vinschool.edu.vn/llms.txt` |
| 79 | FPT Education | `connection_error` | Không thể kết nối đến server (bị chặn IP nước ngoài?) | `https://edu.fpt.vn/llms.txt` |
| 80 | RMIT Vietnam | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.rmit.edu.vn/llms.txt` |
| 81 | Topica | `connection_error` | Không thể kết nối đến server (bị chặn IP nước ngoài?) | `https://topica.vn/llms.txt` |
| 82 | IVS Education | `timeout` | Server không phản hồi sau 10 giây | `https://ivs.edu.vn/llms.txt` |
| 83 | Trường Đại học VinUni | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://vinuni.edu.vn/llms.txt` |
| 84 | Vineco (VinGroup Agri) | `timeout` | Server không phản hồi sau 10 giây | `https://vineco.com.vn/llms.txt` |
| 85 | Vissan | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.vissan.com.vn/llms.txt` |
| 86 | Kinh Đô (Mondelēz) | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.kinhdo.vn/llms.txt` |
| 87 | Bibica | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://bibica.com.vn/llms.txt` |
| 88 | Cholimex Food | `connection_error` | Không thể kết nối đến server (bị chặn IP nước ngoài?) | `https://cholimex.com.vn/llms.txt` |
| 89 | Lộc Trời Group | `connection_error` | Không thể kết nối đến server (bị chặn IP nước ngoài?) | `https://www.loctrigroup.com/llms.txt` |
| 90 | PAN Group | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://thepangroup.com/llms.txt` |
| 91 | Vietravel | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.vietravel.com/llms.txt` |
| 92 | Saigontourist | `connection_error` | Không thể kết nối đến server (bị chặn IP nước ngoài?) | `https://www.saigontourist.net/llms.txt` |
| 93 | Vinpearl | `access_denied` | Truy cập bị từ chối (HTTP 401/403) | `https://www.vinpearl.com/llms.txt` |
| 95 | Fiditour | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://www.fiditour.com/llms.txt` |
| 96 | Tiki | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://tiki.vn/llms.txt` |
| 97 | Shopee Vietnam | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://shopee.vn/llms.txt` |
| 99 | VNPay | `not_llms_txt` | Server trả về HTML/WAF thay vì file văn bản | `https://www.vnpay.vn/llms.txt` |
| 100 | ZaloPay | `not_found` | File /llms.txt không tồn tại (HTTP 404) | `https://zalopay.vn/llms.txt` |

---

## 3. Nhóm 2 — Có Lỗi Validation (2 sites)

**Nguyên nhân:** File /ll.txt tồn tại và có thể đọc, nhưng không đạt ít nhất 1 trong 2 yêu cầu bắt buộc: thiếu H1 title hoặc file rỗng/không đọc được.

| # | Công ty | H1 Title | Lỗi |
| :--- | :--- | :--- | :--- |
| 26 | Vietnamobile | — | File is empty or has no content |
| 94 | BenThanh Tourist | — | File is empty or has no content |

---

## 4. Nhóm 3 — Chỉ Cảnh Báo (2 sites)

**Nguyên nhân:** File /llms.txt hợp lệ nhưng thiếu một số phần không bắt buộc (blockquote, mô tả chi tiết, project details, format links, hoặc có broken links).

| # | Công ty | H1 Title | Links | Cảnh báo |
| :--- | :--- | :--- | ---: | :--- |
| 55 | Vinamilk | Vinamilk (vinamilk.com.vn) | 38 | File List Format |
| 98 | Lazada Vietnam | Lazada Việt Nam (lazada.vn) | 0 | Brief Description (blockquote), Description Paragraphs |

---

## 4. Nhóm 4 — Hợp Lệ Hoàn Toàn (0 sites)

_Không có site nào đạt yêu cầu hoàn toàn._

---

## 5. Phân Bố Mã Lỗi (96 sites fatal)

| Mã lỗi | Số lượng | Tỷ lệ | Mô tả |
| :--- | ---: | ---: | :--- |
| `not_found` | **53** | 55.2% | File /llms.txt không tồn tại (HTTP 404) |
| `not_llms_txt` | **19** | 19.8% | Server trả về HTML/WAF thay vì file văn bản |
| `connection_error` | **11** | 11.5% | Không thể kết nối đến server (bị chặn IP nước ngoài?) |
| `timeout` | **8** | 8.3% | Server không phản hồi sau 10 giây |
| `server_error` | **2** | 2.1% | Server trả về lỗi 5xx |
| `access_denied` | **2** | 2.1% | Truy cập bị từ chối (HTTP 401/403) |
| `http_error` | **1** | 1.0% | Server trả về HTTP không thành công |

---

## 6. Phân Bố Cảnh Báo

| Cảnh báo | Số site | Tỷ lệ (/4 site có llms.txt) |
| :--- | ---: | ---: |
| File List Format (`file_list_format`) | **1** | 25.0% |
| Brief Description (blockquote) (`quote_block`) | **1** | 25.0% |
| Description Paragraphs (`description_paragraphs`) | **1** | 25.0% |

---

## 7. Broken Links

_Không có broken link nào được phát hiện._

---

## 8. Bảng Chi Tiết Tất Cả 100 Sites

> **Ghi chú:** Nhóm 1 = không thể phân tích | Nhóm 2 = có lỗi | Nhóm 3 = chỉ cảnh báo | Nhóm 4 = hợp lệ

| # | Công ty | Nhóm | Mã lỗi / Trạng thái | H1 Title | Errors | Warnings | Links | Broken | Duration |
| :--- | :--- | :--- | :--- | :--- | ---: | ---: | ---: | ---: | ---: |
| 1 | Vietcombank | 1-Fatal | `not_found` | — | — | — | 0 | — | 118ms |
| 2 | VietinBank | 1-Fatal | `not_found` | — | — | — | 0 | — | 222ms |
| 3 | BIDV | 1-Fatal | `connection_error` | — | — | — | 0 | — | 85ms |
| 4 | Agribank | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 289ms |
| 5 | Techcombank | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 1362ms |
| 6 | MB Bank | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 362ms |
| 7 | VPBank | 1-Fatal | `not_found` | — | — | — | 0 | — | 285ms |
| 8 | ACB | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 206ms |
| 9 | HDBank | 1-Fatal | `not_found` | — | — | — | 0 | — | 332ms |
| 10 | SHB | 1-Fatal | `not_found` | — | — | — | 0 | — | 1066ms |
| 11 | Sacombank | 1-Fatal | `not_found` | — | — | — | 0 | — | 113ms |
| 12 | TPBank | 1-Fatal | `timeout` | — | — | — | 0 | — | 10001ms |
| 13 | SeABank | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 336ms |
| 14 | BaoViet | 1-Fatal | `not_found` | — | — | — | 0 | — | 1663ms |
| 15 | PetroVietnam (PVN) | 1-Fatal | `not_found` | — | — | — | 0 | — | 6168ms |
| 16 | PV GAS | 1-Fatal | `not_found` | — | — | — | 0 | — | 106ms |
| 17 | PVOil | 1-Fatal | `not_found` | — | — | — | 0 | — | 159ms |
| 18 | EVN | 1-Fatal | `not_found` | — | — | — | 0 | — | 218ms |
| 19 | EVNNPC | 1-Fatal | `not_found` | — | — | — | 0 | — | 288ms |
| 20 | EVNSPC | 1-Fatal | `not_found` | — | — | — | 0 | — | 177ms |
| 21 | BSR (Bình Sơn) | 1-Fatal | `connection_error` | — | — | — | 0 | — | 62ms |
| 22 | PV Power | 1-Fatal | `not_found` | — | — | — | 0 | — | 235ms |
| 23 | Viettel | 1-Fatal | `not_found` | — | — | — | 0 | — | 107ms |
| 24 | VNPT | 1-Fatal | `connection_error` | — | — | — | 0 | — | 99ms |
| 25 | MobiFone | 1-Fatal | `not_found` | — | — | — | 0 | — | 1481ms |
| 26 | Vietnamobile | 2-Err | — | — | 1 | — | 0 | — | 199ms |
| 27 | FPT Corporation | 1-Fatal | `not_found` | — | — | — | 0 | — | 427ms |
| 28 | CMC Telecom | 1-Fatal | `not_found` | — | — | — | 0 | — | 781ms |
| 29 | BKAV | 1-Fatal | `not_found` | — | — | — | 0 | — | 563ms |
| 30 | VNG Corporation | 1-Fatal | `not_found` | — | — | — | 0 | — | 224ms |
| 31 | Momo | 1-Fatal | `not_found` | — | — | — | 0 | — | 216ms |
| 32 | Zalo | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 113ms |
| 33 | VCCorp | 1-Fatal | `not_found` | — | — | — | 0 | — | 170ms |
| 34 | Vietnix | 1-Fatal | `not_found` | — | — | — | 0 | — | 47ms |
| 35 | Vingroup | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 224ms |
| 36 | Novaland | 1-Fatal | `not_found` | — | — | — | 0 | — | 616ms |
| 37 | Sungroup | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 676ms |
| 38 | Hưng Thịnh Corp | 1-Fatal | `http_error` | — | — | — | 0 | — | 682ms |
| 39 | Nam Long | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 1937ms |
| 40 | Đất Xanh Group | 1-Fatal | `not_found` | — | — | — | 0 | — | 121ms |
| 41 | Khang Điền | 1-Fatal | `not_found` | — | — | — | 0 | — | 442ms |
| 42 | Becamex IDC | 1-Fatal | `connection_error` | — | — | — | 0 | — | 28ms |
| 43 | VNCC (Vinaconex) | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 535ms |
| 44 | Coteccons | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 1625ms |
| 45 | Hòa Phát Group | 1-Fatal | `not_found` | — | — | — | 0 | — | 134ms |
| 46 | Tập đoàn Xây dựng Delta | 1-Fatal | `timeout` | — | — | — | 0 | — | 10007ms |
| 47 | VinCommerce (WinMart) | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 267ms |
| 48 | Thế Giới Di Động | 1-Fatal | `server_error` | — | — | — | 0 | — | 109ms |
| 49 | FPT Shop | 1-Fatal | `not_found` | — | — | — | 0 | — | 404ms |
| 50 | Bách Hóa Xanh | 1-Fatal | `server_error` | — | — | — | 0 | — | 109ms |
| 51 | Saigon Co.op | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 307ms |
| 52 | PNJ | 1-Fatal | `not_found` | — | — | — | 0 | — | 163ms |
| 53 | DOJI Group | 1-Fatal | `not_found` | — | — | — | 0 | — | 648ms |
| 54 | Masan Group | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 1607ms |
| 55 | Vinamilk | 3-Warn | — | Vinamilk (vinamilk.com.vn) | — | 27 | 38 | — | 4467ms |
| 56 | TH True Milk | 1-Fatal | `not_found` | — | — | — | 0 | — | 484ms |
| 57 | Sabeco | 1-Fatal | `not_found` | — | — | — | 0 | — | 153ms |
| 58 | Habeco | 1-Fatal | `not_found` | — | — | — | 0 | — | 137ms |
| 59 | Vietnam Airlines | 1-Fatal | `not_found` | — | — | — | 0 | — | 263ms |
| 60 | Vietjet Air | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 674ms |
| 61 | Bamboo Airways | 1-Fatal | `not_found` | — | — | — | 0 | — | 190ms |
| 62 | VINALINES | 1-Fatal | `timeout` | — | — | — | 0 | — | 10015ms |
| 63 | Tổng cục Hàng hải (Vinamarine) | 1-Fatal | `timeout` | — | — | — | 0 | — | 10014ms |
| 64 | Vinafco | 1-Fatal | `not_found` | — | — | — | 0 | — | 96ms |
| 65 | Gemadept | 1-Fatal | `not_found` | — | — | — | 0 | — | 44ms |
| 66 | VinFast | 1-Fatal | `access_denied` | — | — | — | 0 | — | 230ms |
| 67 | THACO | 1-Fatal | `timeout` | — | — | — | 0 | — | 10013ms |
| 68 | Vinamotor | 1-Fatal | `connection_error` | — | — | — | 0 | — | 62ms |
| 69 | Hòa Phát (Thép) | 1-Fatal | `not_found` | — | — | — | 0 | — | 127ms |
| 70 | Tôn Hoa Sen | 1-Fatal | `timeout` | — | — | — | 0 | — | 10013ms |
| 71 | Pomina Steel | 1-Fatal | `connection_error` | — | — | — | 0 | — | 9ms |
| 72 | Vinmec | 1-Fatal | `not_found` | — | — | — | 0 | — | 451ms |
| 73 | FV Hospital | 1-Fatal | `not_found` | — | — | — | 0 | — | 37ms |
| 74 | Medlatec | 1-Fatal | `not_found` | — | — | — | 0 | — | 109ms |
| 75 | DHG Pharma | 1-Fatal | `not_found` | — | — | — | 0 | — | 110ms |
| 76 | Dược Hậu Giang | 1-Fatal | `not_found` | — | — | — | 0 | — | 113ms |
| 77 | Imexpharm | 1-Fatal | `not_found` | — | — | — | 0 | — | 63ms |
| 78 | VinSchool | 1-Fatal | `not_found` | — | — | — | 0 | — | 558ms |
| 79 | FPT Education | 1-Fatal | `connection_error` | — | — | — | 0 | — | 40ms |
| 80 | RMIT Vietnam | 1-Fatal | `not_found` | — | — | — | 0 | — | 175ms |
| 81 | Topica | 1-Fatal | `connection_error` | — | — | — | 0 | — | 1431ms |
| 82 | IVS Education | 1-Fatal | `timeout` | — | — | — | 0 | — | 10012ms |
| 83 | Trường Đại học VinUni | 1-Fatal | `not_found` | — | — | — | 0 | — | 102ms |
| 84 | Vineco (VinGroup Agri) | 1-Fatal | `timeout` | — | — | — | 0 | — | 10011ms |
| 85 | Vissan | 1-Fatal | `not_found` | — | — | — | 0 | — | 155ms |
| 86 | Kinh Đô (Mondelēz) | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 623ms |
| 87 | Bibica | 1-Fatal | `not_found` | — | — | — | 0 | — | 746ms |
| 88 | Cholimex Food | 1-Fatal | `connection_error` | — | — | — | 0 | — | 261ms |
| 89 | Lộc Trời Group | 1-Fatal | `connection_error` | — | — | — | 0 | — | 330ms |
| 90 | PAN Group | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 4631ms |
| 91 | Vietravel | 1-Fatal | `not_found` | — | — | — | 0 | — | 637ms |
| 92 | Saigontourist | 1-Fatal | `connection_error` | — | — | — | 0 | — | 135ms |
| 93 | Vinpearl | 1-Fatal | `access_denied` | — | — | — | 0 | — | 300ms |
| 94 | BenThanh Tourist | 2-Err | — | — | 1 | — | 0 | — | 797ms |
| 95 | Fiditour | 1-Fatal | `not_found` | — | — | — | 0 | — | 1728ms |
| 96 | Tiki | 1-Fatal | `not_found` | — | — | — | 0 | — | 307ms |
| 97 | Shopee Vietnam | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 285ms |
| 98 | Lazada Vietnam | 3-Warn | — | Lazada Việt Nam (lazada.vn) | — | 2 | 0 | — | 248ms |
| 99 | VNPay | 1-Fatal | `not_llms_txt` | — | — | — | 0 | — | 396ms |
| 100 | ZaloPay | 1-Fatal | `not_found` | — | — | — | 0 | — | 156ms |
