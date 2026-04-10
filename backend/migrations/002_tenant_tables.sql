-- Tenant-level tables — created inside school_{schoolId} schema
-- Run after SET search_path TO school_{id}, public

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role            VARCHAR(30) NOT NULL CHECK (role IN (
                    'SUPER_ADMIN','SCHOOL_ADMIN','ACADEMIC_COORD',
                    'CLASS_TEACHER','SUBJECT_TEACHER','PARENT')),
  name            VARCHAR(200) NOT NULL,
  email           VARCHAR(200),
  mobile_e164     VARCHAR(20),
  password_hash   TEXT,
  sso_provider    VARCHAR(20) CHECK (sso_provider IN ('google', 'microsoft')),
  sso_subject     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_login_at   TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (mobile_e164),
  UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS idx_users_mobile ON users (mobile_e164);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- 2. Students
CREATE TABLE IF NOT EXISTS students (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_no    VARCHAR(50) UNIQUE NOT NULL,
  first_name      VARCHAR(100) NOT NULL,
  last_name       VARCHAR(100) NOT NULL,
  dob             DATE NOT NULL,
  gender          VARCHAR(10) NOT NULL CHECK (gender IN ('male','female','other')),
  grade_id        UUID NOT NULL,
  section_id      UUID NOT NULL,
  photo_url       TEXT,
  blurhash        VARCHAR(50),
  health_notes    TEXT,
  has_iep         BOOLEAN NOT NULL DEFAULT false,
  enrollment_date DATE NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active','inactive','alumni','transferred')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_section ON students (section_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON students (status);
CREATE INDEX IF NOT EXISTS idx_students_name ON students (first_name, last_name);

-- 3. Teachers
CREATE TABLE IF NOT EXISTS teachers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  employee_id     VARCHAR(50) UNIQUE,
  qualification   TEXT,
  joined_at       DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Parents
CREATE TABLE IF NOT EXISTS parents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship    VARCHAR(20) NOT NULL CHECK (relationship IN ('mother','father','guardian','other')),
  alternate_contact VARCHAR(20),
  address         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Student-Parents junction
CREATE TABLE IF NOT EXISTS student_parents (
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id       UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  is_primary      BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (student_id, parent_id)
);

-- 6. Academic Years
CREATE TABLE IF NOT EXISTS academic_years (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(50) NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Terms
CREATE TABLE IF NOT EXISTS terms (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  name            VARCHAR(50) NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT false
);

-- 8. Grade Levels
CREATE TABLE IF NOT EXISTS grade_levels (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(50) NOT NULL,
  sort_order      INT NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Sections
CREATE TABLE IF NOT EXISTS sections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id        UUID NOT NULL REFERENCES grade_levels(id),
  name            VARCHAR(20) NOT NULL,
  class_teacher_id UUID REFERENCES teachers(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  max_students    INT NOT NULL DEFAULT 40,
  UNIQUE (grade_id, name, academic_year_id)
);

-- 10. Subjects
CREATE TABLE IF NOT EXISTS subjects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  code            VARCHAR(20) UNIQUE NOT NULL,
  credit_hours    DECIMAL(4,2) NOT NULL DEFAULT 1,
  is_active       BOOLEAN NOT NULL DEFAULT true
);

-- 11. Timetable Slots (with unique constraint for published slots)
CREATE TABLE IF NOT EXISTS timetable_slots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id      UUID NOT NULL REFERENCES sections(id),
  subject_id      UUID NOT NULL REFERENCES subjects(id),
  teacher_id      UUID NOT NULL REFERENCES teachers(id),
  day_of_week     SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  period_number   SMALLINT NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  room            VARCHAR(50),
  is_published    BOOLEAN NOT NULL DEFAULT false,
  academic_year_id UUID NOT NULL REFERENCES academic_years(id)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_timetable_unique_published
  ON timetable_slots (section_id, day_of_week, period_number, academic_year_id)
  WHERE is_published = true;

-- 12. Attendance (partitioned by date)
CREATE TABLE IF NOT EXISTS attendance (
  id              UUID NOT NULL DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES students(id),
  section_id      UUID NOT NULL REFERENCES sections(id),
  date            DATE NOT NULL,
  period_number   SMALLINT NOT NULL,
  status          VARCHAR(20) NOT NULL
                    CHECK (status IN ('present','absent','late','authorized_absent')),
  marked_by       UUID NOT NULL REFERENCES users(id),
  marked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  edited_at       TIMESTAMPTZ,
  edit_reason     TEXT,
  is_offline_submission BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (id, date)
) PARTITION BY RANGE (date);

-- Create initial partitions (monthly)
CREATE TABLE IF NOT EXISTS attendance_2025 PARTITION OF attendance
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE IF NOT EXISTS attendance_2026 PARTITION OF attendance
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON attendance (student_id, date);
CREATE INDEX IF NOT EXISTS idx_attendance_section_date ON attendance (section_id, date, period_number);

-- 13. Assignments
CREATE TABLE IF NOT EXISTS assignments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id      UUID NOT NULL REFERENCES teachers(id),
  section_id      UUID NOT NULL REFERENCES sections(id),
  subject_id      UUID NOT NULL REFERENCES subjects(id),
  title           VARCHAR(300) NOT NULL,
  description     TEXT NOT NULL,
  due_date        TIMESTAMPTZ NOT NULL,
  file_attachments JSONB NOT NULL DEFAULT '[]',
  status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','published')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_assignments_section ON assignments (section_id, due_date, status);

-- 14. Assignment Submissions (acknowledgments)
CREATE TABLE IF NOT EXISTS assignment_acknowledgments (
  assignment_id   UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  parent_id       UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (assignment_id, parent_id)
);

-- 15. Assessment Components
CREATE TABLE IF NOT EXISTS assessment_components (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  subject_id      UUID NOT NULL REFERENCES subjects(id),
  term_id         UUID NOT NULL REFERENCES terms(id),
  max_marks       DECIMAL(8,2) NOT NULL,
  weightage       DECIMAL(5,2) NOT NULL DEFAULT 100,
  type            VARCHAR(20) NOT NULL
                    CHECK (type IN ('exam','test','assignment','project','other'))
);

-- 16. Grade Entries (partitioned by academic_year)
CREATE TABLE IF NOT EXISTS grade_entries (
  id                    UUID NOT NULL DEFAULT gen_random_uuid(),
  student_id            UUID NOT NULL REFERENCES students(id),
  assessment_component_id UUID NOT NULL REFERENCES assessment_components(id),
  subject_id            UUID NOT NULL REFERENCES subjects(id),
  marks                 DECIMAL(8,2) NOT NULL,
  max_marks             DECIMAL(8,2) NOT NULL,
  feedback_text         TEXT,
  status                VARCHAR(20) NOT NULL DEFAULT 'draft'
                          CHECK (status IN ('draft','published')),
  published_at          TIMESTAMPTZ,
  graded_by             UUID NOT NULL REFERENCES users(id),
  academic_year_id      UUID NOT NULL REFERENCES academic_years(id),
  PRIMARY KEY (id, academic_year_id),
  UNIQUE (student_id, assessment_component_id)
) PARTITION BY LIST (academic_year_id);

-- 17. Report Cards
CREATE TABLE IF NOT EXISTS report_cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES students(id),
  term_id         UUID NOT NULL REFERENCES terms(id),
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pdf_url         TEXT,
  distribution_status VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (distribution_status IN ('pending','generating','ready','distributed')),
  distributed_at  TIMESTAMPTZ,
  UNIQUE (student_id, term_id)
);

-- 18. Fee Structures
CREATE TABLE IF NOT EXISTS fee_structures (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_id        UUID NOT NULL REFERENCES grade_levels(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  total_amount    DECIMAL(12,2) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fee_heads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_structure_id UUID NOT NULL REFERENCES fee_structures(id),
  name            VARCHAR(100) NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  frequency       VARCHAR(20) NOT NULL
                    CHECK (frequency IN ('annual','term','monthly','one-time')),
  is_mandatory    BOOLEAN NOT NULL DEFAULT true,
  tax_percent     DECIMAL(5,2) NOT NULL DEFAULT 0
);

-- 19. Fee Accounts (per student)
CREATE TABLE IF NOT EXISTS fee_accounts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id      UUID NOT NULL REFERENCES students(id),
  fee_structure_id UUID NOT NULL REFERENCES fee_structures(id),
  total_amount    DECIMAL(12,2) NOT NULL,
  paid_amount     DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. Fee Installments
CREATE TABLE IF NOT EXISTS fee_installments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_account_id  UUID NOT NULL REFERENCES fee_accounts(id),
  fee_head_id     UUID NOT NULL REFERENCES fee_heads(id),
  due_date        DATE NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  late_fee_applied DECIMAL(12,2) NOT NULL DEFAULT 0,
  status          VARCHAR(20) NOT NULL DEFAULT 'unpaid'
                    CHECK (status IN ('unpaid','paid','partial','waived')),
  paid_at         TIMESTAMPTZ,
  payment_reference VARCHAR(200)
);

CREATE INDEX IF NOT EXISTS idx_fee_installments_status_due ON fee_installments (status, due_date);

-- 21. Payments
CREATE TABLE IF NOT EXISTS payments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fee_installment_id  UUID NOT NULL REFERENCES fee_installments(id),
  student_id          UUID NOT NULL REFERENCES students(id),
  amount              DECIMAL(12,2) NOT NULL,
  gateway             VARCHAR(20) NOT NULL CHECK (gateway IN ('razorpay','stripe')),
  gateway_order_id    VARCHAR(200) NOT NULL,
  gateway_payment_id  VARCHAR(200) UNIQUE,
  idempotency_key     VARCHAR(200) UNIQUE NOT NULL,
  status              VARCHAR(20) NOT NULL
                        CHECK (status IN ('pending','success','failed','refunded','cancelled')),
  receipt_url         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           VARCHAR(300) NOT NULL,
  body            TEXT NOT NULL,
  author_id       UUID NOT NULL REFERENCES users(id),
  audience_type   VARCHAR(20) NOT NULL
                    CHECK (audience_type IN ('school','grade','section','individual')),
  audience_ids    JSONB NOT NULL DEFAULT '[]',
  channels        JSONB NOT NULL DEFAULT '["push"]',
  status          VARCHAR(20) NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft','scheduled','sent')),
  scheduled_at    TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  attachment_url  TEXT,
  requires_ack    BOOLEAN NOT NULL DEFAULT false,
  is_emergency    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_announcements_status ON announcements (status, scheduled_at);

-- 23. Announcement Deliveries
CREATE TABLE IF NOT EXISTS announcement_deliveries (
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  channel         VARCHAR(20) NOT NULL,
  delivered_at    TIMESTAMPTZ,
  read_at         TIMESTAMPTZ,
  acknowledged_at TIMESTAMPTZ,
  PRIMARY KEY (announcement_id, user_id, channel)
);

-- 24. Conversations
CREATE TABLE IF NOT EXISTS conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id       UUID NOT NULL REFERENCES parents(id),
  teacher_id      UUID NOT NULL REFERENCES teachers(id),
  student_id      UUID NOT NULL REFERENCES students(id),
  subject_id      UUID REFERENCES subjects(id),
  last_message    TEXT,
  last_message_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_conversations_unique
  ON conversations (parent_id, teacher_id, student_id);

-- 25. Messages
CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id),
  receiver_id     UUID NOT NULL REFERENCES users(id),
  body            TEXT NOT NULL,
  attachment_url  TEXT,
  attachment_name VARCHAR(200),
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at    TIMESTAMPTZ,
  read_at         TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id, sent_at);

-- 26. Notifications (90-day rolling window partitioned)
CREATE TABLE IF NOT EXISTS notifications (
  id              UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  type            VARCHAR(50) NOT NULL,
  category        VARCHAR(30) NOT NULL,
  title           VARCHAR(300) NOT NULL,
  body            TEXT NOT NULL,
  deep_link       TEXT,
  is_read         BOOLEAN NOT NULL DEFAULT false,
  channel         VARCHAR(20) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Rolling 90-day partitions
CREATE TABLE IF NOT EXISTS notifications_current PARTITION OF notifications
  FOR VALUES FROM (NOW() - INTERVAL '90 days') TO (NOW() + INTERVAL '30 days');

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications (user_id, is_read, created_at);

-- 27. Device Tokens
CREATE TABLE IF NOT EXISTS device_tokens (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform        VARCHAR(10) NOT NULL CHECK (platform IN ('ios','android')),
  token           TEXT NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  last_used_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, token)
);

-- 28. Audit Logs (2-year retention, partitioned)
CREATE TABLE IF NOT EXISTS audit_logs (
  id              UUID NOT NULL DEFAULT gen_random_uuid(),
  actor_id        UUID NOT NULL REFERENCES users(id),
  event_type      VARCHAR(100) NOT NULL,
  entity_type     VARCHAR(50) NOT NULL,
  entity_id       UUID NOT NULL,
  ip_address      INET,
  device_info     JSONB,
  before_value    JSONB,
  after_value     JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

CREATE TABLE IF NOT EXISTS audit_logs_2025 PARTITION OF audit_logs
  FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
CREATE TABLE IF NOT EXISTS audit_logs_2026 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs (actor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_logs (entity_type, entity_id);

-- 29. Leave Requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  leave_type      VARCHAR(30) NOT NULL,
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  reason          TEXT NOT NULL,
  document_url    TEXT,
  status          VARCHAR(20) NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected')),
  reviewed_by     UUID REFERENCES users(id),
  review_note     TEXT,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 30. PTM Slots
CREATE TABLE IF NOT EXISTS ptm_slots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id      UUID NOT NULL REFERENCES teachers(id),
  date            DATE NOT NULL,
  start_time      TIME NOT NULL,
  end_time        TIME NOT NULL,
  is_available    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 31. PTM Bookings
CREATE TABLE IF NOT EXISTS ptm_bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ptm_slot_id     UUID NOT NULL REFERENCES ptm_slots(id),
  parent_id       UUID NOT NULL REFERENCES parents(id),
  student_id      UUID NOT NULL REFERENCES students(id),
  booked_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status          VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                    CHECK (status IN ('confirmed','cancelled'))
);

-- 32. Bus Routes
CREATE TABLE IF NOT EXISTS bus_routes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 33. Student Routes
CREATE TABLE IF NOT EXISTS student_routes (
  student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  bus_route_id    UUID NOT NULL REFERENCES bus_routes(id) ON DELETE CASCADE,
  pickup_stop     VARCHAR(100),
  drop_stop       VARCHAR(100),
  pickup_time     TIME,
  drop_time       TIME,
  PRIMARY KEY (student_id, bus_route_id)
);
