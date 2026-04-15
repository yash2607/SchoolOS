import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, type UserRole } from '../entities/user.entity';
import { School } from '../entities/school.entity';

type DemoAccount = {
  name: string;
  email: string;
  mobileE164: string;
  role: UserRole;
  password: string;
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: 'Aarav Kapoor',
    email: 'superadmin@demo.schoolos.app',
    mobileE164: '+919810000001',
    role: 'SUPER_ADMIN',
    password: 'SchoolOS@123',
  },
  {
    name: 'Ishita Rao',
    email: 'admin@demo.schoolos.app',
    mobileE164: '+919810000002',
    role: 'SCHOOL_ADMIN',
    password: 'SchoolOS@123',
  },
  {
    name: 'Neha Sharma',
    email: 'coordinator@demo.schoolos.app',
    mobileE164: '+919810000003',
    role: 'ACADEMIC_COORD',
    password: 'SchoolOS@123',
  },
  {
    name: 'Rohan Mehta',
    email: 'classteacher@demo.schoolos.app',
    mobileE164: '+919810000004',
    role: 'CLASS_TEACHER',
    password: 'SchoolOS@123',
  },
  {
    name: 'Sanya Iyer',
    email: 'subjectteacher@demo.schoolos.app',
    mobileE164: '+919810000005',
    role: 'SUBJECT_TEACHER',
    password: 'SchoolOS@123',
  },
  {
    name: 'Priya Nair',
    email: 'parent@demo.schoolos.app',
    mobileE164: '+919810000006',
    role: 'PARENT',
    password: 'SchoolOS@123',
  },
];

@Injectable()
export class DemoUsersService implements OnModuleInit {
  private readonly logger = new Logger(DemoUsersService.name);

  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(School) private readonly schoolRepo: Repository<School>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (process.env['DEMO_USERS_ENABLED'] === 'false') {
      this.logger.log('Demo account bootstrap skipped because DEMO_USERS_ENABLED=false');
      return;
    }

    const school = await this.findOrCreateSchool();
    let createdCount = 0;

    for (const account of DEMO_ACCOUNTS) {
      const existing = await this.userRepo.findOne({
        where: [{ email: account.email }, { mobileE164: account.mobileE164 }],
      });

      if (existing) {
        if (!existing.passwordHash) {
          existing.passwordHash = await bcrypt.hash(account.password, 10);
          existing.schoolId = existing.schoolId ?? school.id;
          existing.role = existing.role ?? account.role;
          existing.isActive = true;
          await this.userRepo.save(existing);
          this.logger.log(`Backfilled password for demo ${account.role} user ${account.email}`);
        }
        continue;
      }

      await this.userRepo.save(
        this.userRepo.create({
          name: account.name,
          email: account.email,
          mobileE164: account.mobileE164,
          passwordHash: await bcrypt.hash(account.password, 10),
          role: account.role,
          schoolId: school.id,
          isActive: true,
          ssoProvider: null,
        }),
      );
      createdCount += 1;
    }

    if (createdCount > 0) {
      this.logger.log(`Seeded ${createdCount} demo login accounts for SchoolOS`);
    }
  }

  private async findOrCreateSchool(): Promise<School> {
    const existingSchool = await this.schoolRepo.findOne({ where: { isActive: true } });
    if (existingSchool) {
      return existingSchool;
    }

    return this.schoolRepo.save(
      this.schoolRepo.create({
        name: 'Demo School',
        timezone: 'Asia/Kolkata',
        logoUrl: null,
        isActive: true,
      }),
    );
  }
}
