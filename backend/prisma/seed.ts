import { PrismaClient, BookingStatus, PaymentMode, RoomStatus, RoomType, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const ROOM_DEFS: Array<{
  roomNumber: string;
  floor: number;
  roomType: RoomType;
  capacity: number;
  price: number;
  status: RoomStatus;
}> = [
  { roomNumber: '101', floor: 1, roomType: RoomType.DELUXE, capacity: 2, price: 3500, status: RoomStatus.AVAILABLE },
  { roomNumber: '102', floor: 1, roomType: RoomType.SUITE, capacity: 3, price: 5500, status: RoomStatus.AVAILABLE },
  { roomNumber: '103', floor: 1, roomType: RoomType.FAMILY, capacity: 4, price: 4500, status: RoomStatus.MAINTENANCE },
  { roomNumber: '104', floor: 1, roomType: RoomType.EXECUTIVE, capacity: 2, price: 6500, status: RoomStatus.AVAILABLE },
  { roomNumber: '105', floor: 1, roomType: RoomType.STANDARD, capacity: 2, price: 2500, status: RoomStatus.AVAILABLE },
  { roomNumber: '201', floor: 2, roomType: RoomType.DELUXE, capacity: 2, price: 3500, status: RoomStatus.AVAILABLE },
  { roomNumber: '202', floor: 2, roomType: RoomType.SUITE, capacity: 3, price: 5500, status: RoomStatus.AVAILABLE },
  { roomNumber: '203', floor: 2, roomType: RoomType.FAMILY, capacity: 4, price: 4500, status: RoomStatus.AVAILABLE },
  { roomNumber: '204', floor: 2, roomType: RoomType.EXECUTIVE, capacity: 2, price: 6500, status: RoomStatus.AVAILABLE },
  { roomNumber: '205', floor: 2, roomType: RoomType.STANDARD, capacity: 2, price: 2500, status: RoomStatus.AVAILABLE },
];

const CUSTOMERS = [
  ['Aarav Kumar', '+919000000137', 'aarav.kumar1@email.com', 'AADHAR-1017-2013-3011', '22, Pune, India'],
  ['Vivaan Nair', '+919000000274', 'vivaan.nair2@email.com', 'AADHAR-1034-2026-3022', '34, Bengaluru, India'],
  ['Aditya Joshi', '+919000000411', 'aditya.joshi3@email.com', 'AADHAR-1051-2039-3033', '46, Hyderabad, India'],
  ['Vihaan Chopra', '+919000000548', 'vihaan.chopra4@email.com', 'AADHAR-1068-2052-3044', '58, Chennai, India'],
  ['Arjun Mehta', '+919000000685', 'arjun.mehta5@email.com', 'AADHAR-1085-2065-3055', '12, Mumbai, India'],
  ['Sai Reddy', '+919000000822', 'sai.reddy6@email.com', 'AADHAR-1102-2078-3066', '78, Kochi, India'],
  ['Reyansh Iyer', '+919000000959', 'reyansh.iyer7@email.com', 'AADHAR-1119-2091-3077', '90, Ahmedabad, India'],
  ['Muhammad Khan', '+919000001096', 'muhammad.khan8@email.com', 'AADHAR-1136-2104-3088', '15, Delhi, India'],
  ['Ishaan Gupta', '+919000001233', 'ishaan.gupta9@email.com', 'AADHAR-1153-2117-3099', '27, Jaipur, India'],
  ['Kabir Sharma', '+919000001370', 'kabir.sharma10@email.com', 'AADHAR-1170-2130-3110', '39, Kolkata, India'],
] as const;

function date(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function totals(rent: number, discount: number, gst: number, advance: number) {
  const totalAmount = Math.max(0, rent - discount) + gst;
  return { totalAmount, balanceAmount: Math.max(0, totalAmount - advance) };
}

async function main() {
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? 'admin@hotel.com').toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'password123';
  const adminName = process.env.SEED_ADMIN_NAME ?? 'Front Desk Admin';

  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.room.deleteMany();
  await prisma.user.deleteMany();
  await prisma.hotelSetting.deleteMany();

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.createMany({
    data: [
      {
        name: adminName,
        email: adminEmail,
        password: passwordHash,
        role: Role.ADMIN,
      },
      {
        name: 'Seed Admin (example.com)',
        email: 'admin@example.com',
        password: passwordHash,
        role: Role.ADMIN,
      },
    ],
  });

  await prisma.hotelSetting.create({
    data: {
      hotelName: 'Cedar Ridge Lodge',
      logo: '',
      gstNumber: '27AABCU9603R1ZM',
      address: '12 Hill View Road, Lonavala, Maharashtra 410401',
      phone: '+919876543210',
      email: 'front.desk@cedarridgelodge.com',
      currency: 'INR',
    },
  });

  const rooms = [];
  for (const room of ROOM_DEFS) {
    rooms.push(await prisma.room.create({ data: room }));
  }

  const customers = [];
  for (const [name, mobile, email, idProofNumber, address] of CUSTOMERS) {
    customers.push(
      await prisma.customer.create({
        data: {
          name,
          mobile,
          email,
          idProofType: 'AADHAR',
          idProofNumber,
          address,
        },
      }),
    );
  }

  const modes: PaymentMode[] = [PaymentMode.UPI, PaymentMode.CARD, PaymentMode.CASH, PaymentMode.BANK_TRANSFER];
  const statuses: BookingStatus[] = [
    BookingStatus.CHECKED_OUT,
    BookingStatus.CHECKED_OUT,
    BookingStatus.BOOKED,
    BookingStatus.CHECKED_IN,
    BookingStatus.CANCELLED,
  ];

  for (let i = 0; i < 20; i += 1) {
    const room = rooms[i % rooms.length];
    const customer = customers[i % customers.length];
    const day = 1 + (i % 20);
    const checkIn = date(`2026-07-${String(day).padStart(2, '0')}`);
    const checkOut = date(`2026-07-${String(Math.min(day + 2, 28)).padStart(2, '0')}`);
    const nights = Math.max(1, (checkOut.getTime() - checkIn.getTime()) / 86400000);
    const rent = Number(room.price) * nights;
    const gst = Math.round(rent * 0.12);
    const advance = Math.round((rent + gst) * 0.4);
    const { totalAmount, balanceAmount } = totals(rent, 0, gst, advance);
    const status = statuses[i % statuses.length];
    const paymentMode = modes[i % modes.length];

    const booking = await prisma.booking.create({
      data: {
        bookingNumber: `BK-20260701-${String(i + 1).padStart(4, '0')}`,
        customerId: customer.id,
        roomId: room.id,
        checkIn,
        checkOut,
        adults: 2,
        children: i % 3 === 0 ? 1 : 0,
        rent,
        discount: 0,
        gst,
        totalAmount,
        advanceAmount: status === BookingStatus.CANCELLED ? 0 : advance,
        balanceAmount: status === BookingStatus.CHECKED_OUT ? 0 : status === BookingStatus.CANCELLED ? 0 : balanceAmount,
        paymentMode,
        status,
        notes: 'Seed sample booking',
      },
    });

    if (status !== BookingStatus.CANCELLED && advance > 0) {
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: status === BookingStatus.CHECKED_OUT ? totalAmount : advance,
          paymentMode,
          notes: 'Seed payment',
        },
      });
    }

    if (status === BookingStatus.CHECKED_IN) {
      await prisma.room.update({
        where: { id: room.id },
        data: { status: RoomStatus.OCCUPIED },
      });
    }
  }

  console.log('Seed complete.');
  console.log(`Admin: ${adminEmail} / (SEED_ADMIN_PASSWORD)`);
  console.log('Also created: admin@example.com with the same password.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
