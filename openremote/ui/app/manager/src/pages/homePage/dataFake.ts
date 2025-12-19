// dataKafe.ts

export const fakeDevices = [
  {
    deviceCode: "SPK-001",
    deviceName: "Loa Hội Trường A",
    currentProgram: "Nhạc nền buổi sáng",
    speakerCount: 4,
    volume: 30,
    status: true,
    lat: 21.0278, // <— đã có tọa độ
    lng: 105.8342, // <— đã có tọa độ
    phone: "0988555123",
    group: "Khu A",
    address: "Số 12 Hai Bà Trưng, Hà Nội",
  },
  {
    deviceCode: "SPK-002",
    deviceName: "Loa Hội Trường B",
    currentProgram: "Thông báo học sinh",
    speakerCount: 2,
    volume: 50,
    status: false,
    lat: 21.032, // <— đã có tọa độ
    lng: 105.82, // <— đã có tọa độ
    phone: "0988111000",
    group: "Khu B",
    address: "Số 22 Lý Thường Kiệt, Hà Nội",
  },
  {
    deviceCode: "SPK-003",
    deviceName: "Loa Sân vận động",
    currentProgram: "Nhạc chào mừng",
    speakerCount: 10,
    volume: 80,
    status: true,
    lat: 21.03, // <— đã có tọa độ
    lng: 105.85, // <— đã có tọa độ
    phone: "0904455667",
    group: "Ngoài trời",
    address: "Sân vận động huyện Ba Vì",
  },
  {
    deviceCode: "SPK-004",
    deviceName: "Loa Phòng họp 1",
    currentProgram: "Họp trực tuyến",
    speakerCount: 1,
    volume: 60,
    status: true,
    lat: 21.01, // <— đã có tọa độ
    lng: 105.82, // <— đã có tọa độ
    phone: "0912003322",
    group: "Phòng họp",
    address: "UBND TP Hà Nội - Phòng họp 1",
  },
];

export const fakeDevices2 = [
  {
    deviceCode: "SPK-010",
    deviceName: "Loa Trung Tâm Quận 1",
    currentProgram: "Bản tin buổi chiều",
    speakerCount: 6,
    volume: 45,
    status: true,
    lat: 10.7769,
    lng: 106.7009,
    phone: "0909123456",
    group: "Khu Trung Tâm",
    address: "86 Lê Lợi, Quận 1, TP. Hồ Chí Minh",
  },
  {
    deviceCode: "SPK-011",
    deviceName: "Loa Nhà Văn Hóa Quận 5",
    currentProgram: "Thông báo cộng đồng",
    speakerCount: 3,
    volume: 55,
    status: false,
    lat: 10.754,
    lng: 106.66,
    phone: "0912333444",
    group: "Nhà Văn Hóa",
    address: "105 Trần Hưng Đạo, Quận 5, TP. Hồ Chí Minh",
  },
  {
    deviceCode: "SPK-012",
    deviceName: "Loa Biển Báo Cần Giờ",
    currentProgram: "Cảnh báo thời tiết",
    speakerCount: 2,
    volume: 75,
    status: true,
    lat: 10.411,
    lng: 106.954,
    phone: "0977332211",
    group: "Ven Biển",
    address: "Thị trấn Cần Thạnh, Cần Giờ, TP. Hồ Chí Minh",
  },
  {
    deviceCode: "SPK-013",
    deviceName: "Loa Công viên Gia Định",
    currentProgram: "Nhạc thư giãn",
    speakerCount: 5,
    volume: 40,
    status: true,
    lat: 10.8197,
    lng: 106.6777,
    phone: "0988776655",
    group: "Công viên",
    address: "Công viên Gia Định, Gò Vấp, TP. Hồ Chí Minh",
  },
];


export const fakeSchedule = [
  { time: "07:00", programName: "Nhạc nền buổi sáng 	Nhạc nền buổi sáng 	Nhạc nền buổi sáng 	Nhạc nền buổi sáng" },
  { time: "09:00", programName: "Thông báo học sinh" },
  { time: "11:00", programName: "Nhạc chào mừng" },
  { time: "13:00", programName: "Họp trực tuyến" },
  { time: "15:00", programName: "Nhạc thư giãn" },
];

export const fakeDeviceHistory = [
  { time: "2025-12-09 08:00", action: "Bật thiết bị" },
  { time: "2025-12-09 12:30", action: "Tắt thiết bị" },
  { time: "2025-12-09 14:00", action: "Điều chỉnh âm lượng" },
  { time: "2025-12-09 15:10", action: "Tạm dừng chương trình" },
];

export const treeLocations = [
  {
    id: "hanoi",
    label: "Thành phố Hà Nội",
    children: [
      {
        id: "hk",
        label: "Phường Hoàn Kiếm",
        children: [
          { id: "hk-1", label: "Tổ dân phố 01" },
          { id: "hk-2", label: "Tổ dân phố 02" },
        ],
      },
      {
        id: "bd",
        label: "Phường Ba Đình",
        children: [
          { id: "bd-1", label: "Tổ dân phố 05" },
          { id: "bd-2", label: "Tổ dân phố 06" },
        ],
      },
    ],
  },
];
