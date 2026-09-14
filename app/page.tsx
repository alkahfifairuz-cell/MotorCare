"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type MotorRecord = {
  id: string;
  owner_id: string;
  name: string;
  brand: string;
  model: string;
  plate_number: string;
  year: string;
  color: string;
  notes: string;
  is_active: boolean;
  is_public: boolean;
};

type ScheduleRecord = {
  id: string;
  motor_id: string;
  frequency: string;
  day_of_week: string;
  time: string;
  service_type: string;
  is_active: boolean;
  next_date: string;
};

type MaintenanceRecord = {
  id: string;
  motor_id: string;
  schedule_id: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes: string;
};

function formatDate(dateString: string) {
  if (!dateString) return "-";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatShortDate(dateString: string) {
  if (!dateString) return "-";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function formatMonthDay(dateString: string) {
  if (!dateString) return "-";

  const date = new Date(`${dateString}T00:00:00`);

  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
  }).format(date);
}

function getMotorLabel(motor: MotorRecord) {
  const fullName = [motor.brand, motor.model].filter(Boolean).join(" ");

  return fullName || motor.name || "Motorcycle";
}

function getMotorType(motor: MotorRecord) {
  if (motor.name) return motor.name;

  return "Daily Ride";
}

function getStatusLabel(motor: MotorRecord) {
  if (!motor.is_active) return "Inactive";

  return "Ready";
}

function getActivityTitle(
  maintenance: MaintenanceRecord,
  schedules: ScheduleRecord[],
) {
  const schedule = schedules.find(
    (item) => item.id === maintenance.schedule_id,
  );

  if (schedule?.service_type) {
    return schedule.service_type;
  }

  if (maintenance.notes?.trim()) {
    return "Maintenance";
  }

  return "Motor Care";
}

function getActivityDetail(
  maintenance: MaintenanceRecord,
  schedules: ScheduleRecord[],
) {
  const schedule = schedules.find(
    (item) => item.id === maintenance.schedule_id,
  );

  if (maintenance.notes?.trim()) {
    return maintenance.notes;
  }

  if (schedule?.service_type) {
    return `${schedule.service_type} · MotorCare`;
  }

  return "Perawatan motor tercatat di MotorCare.";
}

function getStatusClass(status: string) {
  const normalized = status.toLowerCase();

  if (
    normalized.includes("complete") ||
    normalized.includes("completed") ||
    normalized.includes("done") ||
    normalized.includes("selesai")
  ) {
    return "border-emerald-400/10 bg-emerald-400/[0.05] text-emerald-300/80";
  }

  if (
    normalized.includes("cancel") ||
    normalized.includes("cancelled") ||
    normalized.includes("batal")
  ) {
    return "border-red-400/10 bg-red-400/[0.05] text-red-300/80";
  }

  return "border-blue-400/10 bg-blue-400/[0.05] text-blue-300/80";
}

export default function Home() {
  const [motors, setMotors] = useState<MotorRecord[]>([]);
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [activities, setActivities] = useState<MaintenanceRecord[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [realtimeStatus, setRealtimeStatus] = useState<
    "connecting" | "live" | "error"
  >("connecting");

  async function loadPublicData() {
    try {
      setError("");

      const supabase = createClient();

      const [
        { data: motorData, error: motorError },
        { data: scheduleData, error: scheduleError },
        { data: maintenanceData, error: maintenanceError },
      ] = await Promise.all([
        supabase
          .from("motors")
          .select(
            "id, owner_id, name, brand, model, plate_number, year, color, notes, is_active, is_public",
          )
          .eq("is_public", true)
          .eq("is_active", true)
          .order("created_at", { ascending: true }),

        supabase
          .from("schedules")
          .select(
            "id, motor_id, frequency, day_of_week, time, service_type, is_active, next_date",
          )
          .eq("is_active", true)
          .order("next_date", { ascending: true }),

        supabase
          .from("maintenance_records")
          .select(
            "id, motor_id, schedule_id, date, start_time, end_time, status, notes",
          )
          .order("date", { ascending: false })
          .limit(30),
      ]);

      if (motorError) {
        throw new Error(motorError.message);
      }

      if (scheduleError) {
        throw new Error(scheduleError.message);
      }

      if (maintenanceError) {
        throw new Error(maintenanceError.message);
      }

      setMotors(motorData ?? []);
      setSchedules(scheduleData ?? []);
      setActivities(maintenanceData ?? []);
    } catch (err) {
      console.error("MotorCare public data error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengambil data MotorCare.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPublicData();
  }, []);

  useEffect(() => {
    if (loading) return;

    const supabase = createClient();

    const channel = supabase
      .channel("motorcare-public-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "motors",
        },
        () => {
          void loadPublicData();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "schedules",
        },
        () => {
          void loadPublicData();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "maintenance_records",
        },
        () => {
          void loadPublicData();
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setRealtimeStatus("live");
        } else if (
          status === "CHANNEL_ERROR" ||
          status === "TIMED_OUT"
        ) {
          setRealtimeStatus("error");
        } else {
          setRealtimeStatus("connecting");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loading]);

  const publicActivities = useMemo(() => {
    const publicMotorIds = new Set(motors.map((motor) => motor.id));

    return activities
      .filter((activity) => publicMotorIds.has(activity.motor_id))
      .sort((a, b) => {
        return (
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
        );
      })
      .slice(0, 6);
  }, [activities, motors]);

  const thisMonthCount = useMemo(() => {
    const now = new Date();

    return activities.filter((activity) => {
      const date = new Date(`${activity.date}T00:00:00`);

      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      );
    }).length;
  }, [activities]);

  const nextSchedule = useMemo(() => {
    const publicMotorIds = new Set(motors.map((motor) => motor.id));

    return schedules
      .filter(
        (schedule) =>
          publicMotorIds.has(schedule.motor_id) &&
          schedule.is_active &&
          schedule.next_date,
      )
      .sort(
        (a, b) =>
          new Date(a.next_date).getTime() -
          new Date(b.next_date).getTime(),
      );
  }, [schedules, motors]);

  function getLastMaintenance(motorId: string) {
    const motorMaintenance = activities
      .filter((activity) => activity.motor_id === motorId)
      .sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime(),
      );

    return motorMaintenance[0] ?? null;
  }

  function getNextSchedule(motorId: string) {
    return (
      schedules
        .filter(
          (schedule) =>
            schedule.motor_id === motorId &&
            schedule.is_active &&
            schedule.next_date,
        )
        .sort(
          (a, b) =>
            new Date(a.next_date).getTime() -
            new Date(b.next_date).getTime(),
        )[0] ?? null
    );
  }

  const firstMotor = motors[0];
  const firstMotorLastCare = firstMotor
    ? getLastMaintenance(firstMotor.id)
    : null;
  const firstMotorNextSchedule = firstMotor
    ? getNextSchedule(firstMotor.id)
    : null;

  const careStatus =
    motors.length === 0
      ? "—"
      : motors.every((motor) => motor.is_active)
        ? "100%"
        : "Good";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07090c] text-white">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#07090c]/85 backdrop-blur-2xl">
        <nav className="mx-auto flex h-[70px] max-w-[1400px] items-center justify-between px-5 sm:px-7 lg:px-10">
          {/* LOGO */}
          <a
            href="#home"
            className="group flex shrink-0 items-center"
          >
            <Image
              src="/motorcare-logo.png"
              alt="MotorCare"
              width={150}
              height={45}
              priority
              className="h-auto w-[100px] object-contain transition duration-300 group-hover:opacity-80 sm:w-[108px]"
            />
          </a>

          {/* MENU */}
          <div className="hidden items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.025] p-1 md:flex">
            <a
              href="#home"
              className="rounded-full bg-white/[0.09] px-5 py-2 text-[13px] font-semibold text-white"
            >
              Home
            </a>

            <a
              href="#motor"
              className="rounded-full px-5 py-2 text-[13px] font-medium text-white/45 transition hover:bg-white/[0.06] hover:text-white"
            >
              Motor
            </a>

            <a
              href="#activity"
              className="rounded-full px-5 py-2 text-[13px] font-medium text-white/45 transition hover:bg-white/[0.06] hover:text-white"
            >
              Activity
            </a>

            <a
              href="#about"
              className="rounded-full px-5 py-2 text-[13px] font-medium text-white/45 transition hover:bg-white/[0.06] hover:text-white"
            >
              About
            </a>
          </div>

          {/* ADMIN */}
          <a
            href="/admin/login"
            className="flex shrink-0 items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.035] px-4 py-2 text-[12px] font-semibold text-white/75 transition hover:border-blue-400/30 hover:bg-blue-400/[0.08] hover:text-white"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]" />
            Admin
          </a>
        </nav>
      </header>

      {/* HERO */}
      <section id="home" className="relative isolate">
        <div className="pointer-events-none absolute left-1/2 top-[-120px] -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/[0.08] blur-[130px]" />
        <div className="pointer-events-none absolute right-[-180px] top-[300px] -z-10 h-[400px] w-[400px] rounded-full bg-cyan-400/[0.04] blur-[110px]" />

        <div className="mx-auto grid min-h-[650px] max-w-[1400px] items-center gap-12 px-5 py-20 sm:px-7 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:py-24">
          {/* LEFT */}
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-400/[0.05] px-4 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-400 shadow-[0_0_12px_rgba(96,165,250,0.9)]" />

              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-300/80">
                Motorcycle Care System
              </span>
            </div>

            <h1 className="max-w-4xl text-[48px] font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-[64px] lg:text-[78px]">
              Keep your ride
              <br />
              <span className="text-white/35">
                looking its best.
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-[15px] leading-7 text-white/45 sm:text-[16px]">
              Satu tempat untuk mencatat perawatan, jadwal cuci,
              pembayaran, dan produk yang digunakan untuk setiap
              motor.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href="#motor"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-6 py-3.5 text-[13px] font-semibold text-[#080a0d] transition hover:bg-blue-100"
              >
                View my motors

                <span className="transition-transform group-hover:translate-x-1">
                  →
                </span>
              </a>

              <a
                href="#activity"
                className="inline-flex items-center rounded-full border border-white/[0.1] bg-white/[0.025] px-6 py-3.5 text-[13px] font-semibold text-white/70 transition hover:bg-white/[0.06] hover:text-white"
              >
                View activity
              </a>
            </div>

            {/* STATS */}
            <div className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-white/[0.07] pt-7">
              <div>
                <p className="text-2xl font-semibold tracking-tight">
                  {loading ? "—" : String(motors.length).padStart(2, "0")}
                </p>

                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/30">
                  Active Motors
                </p>
              </div>

              <div>
                <p className="text-2xl font-semibold tracking-tight">
                  {loading
                    ? "—"
                    : String(thisMonthCount).padStart(2, "0")}
                </p>

                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/30">
                  This Month
                </p>
              </div>

              <div>
                <p className="text-2xl font-semibold tracking-tight">
                  {loading ? "—" : careStatus}
                </p>

                <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-white/30">
                  Care Status
                </p>
              </div>
            </div>

            {/* LIVE STATUS */}
            {!loading && (
              <div className="mt-5 flex items-center gap-2">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    realtimeStatus === "live"
                      ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.7)]"
                      : realtimeStatus === "error"
                        ? "bg-red-400"
                        : "bg-blue-400"
                  }`}
                />

                <span className="text-[9px] uppercase tracking-[0.16em] text-white/20">
                  {realtimeStatus === "live"
                    ? "Live system"
                    : realtimeStatus === "error"
                      ? "Live sync unavailable"
                      : "Connecting"}
                </span>
              </div>
            )}
          </div>

          {/* RIGHT VISUAL */}
          <div className="relative mx-auto w-full max-w-[560px]">
            <div className="absolute inset-8 rounded-full bg-blue-500/[0.08] blur-[80px]" />

            <div className="relative overflow-hidden rounded-[32px] border border-white/[0.09] bg-gradient-to-br from-[#12171d] via-[#0c1015] to-[#080a0d] p-5 shadow-2xl shadow-black/40 sm:p-7">
              {/* TOP */}
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                    Current Ride
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    {loading
                      ? "Loading..."
                      : firstMotor
                        ? getMotorLabel(firstMotor)
                        : "No public motor"}
                  </p>
                </div>

                <div className="flex items-center gap-2 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                  <span className="text-[10px] font-semibold text-emerald-300">
                    {firstMotor ? "READY" : "WAITING"}
                  </span>
                </div>
              </div>

              {/* BIKE VISUAL */}
              <div className="relative flex h-[300px] items-center justify-center">
                <div className="absolute h-[210px] w-[210px] rounded-full border border-blue-400/[0.08]" />

                <div className="absolute h-[260px] w-[260px] rounded-full border border-white/[0.035]" />

                <div className="relative w-[330px]">
                  <div className="absolute bottom-[-8px] left-[27px] h-[82px] w-[42px] rounded-full border-[6px] border-[#343b43] bg-[#080a0c]" />

                  <div className="absolute bottom-[-8px] right-[25px] h-[82px] w-[42px] rounded-full border-[6px] border-[#343b43] bg-[#080a0c]" />

                  <div className="absolute left-[75px] top-[70px] h-[82px] w-[175px] rotate-[-5deg] rounded-[48%_55%_35%_35%] border border-white/[0.08] bg-gradient-to-br from-[#29313a] to-[#11161b] shadow-xl" />

                  <div className="absolute left-[128px] top-[42px] h-[72px] w-[82px] rotate-[8deg] rounded-[55%_45%_30%_35%] bg-gradient-to-br from-[#3a444f] to-[#171c22]" />

                  <div className="absolute left-[143px] top-[20px] h-[55px] w-[65px] -rotate-[8deg] rounded-[45%_55%_20%_20%] border border-blue-300/[0.12] bg-blue-300/[0.04]" />

                  <div className="absolute left-[125px] top-[26px] h-[9px] w-[115px] rotate-[3deg] rounded-full bg-[#515b65]" />

                  <div className="absolute right-[48px] top-[95px] h-[13px] w-[30px] rotate-[8deg] rounded-full bg-blue-300/80 shadow-[0_0_24px_rgba(96,165,250,0.65)]" />

                  <div className="absolute left-[96px] top-[133px] h-[2px] w-[125px] rotate-[-4deg] bg-blue-400/50 shadow-[0_0_12px_rgba(96,165,250,0.35)]" />

                  <div className="absolute bottom-[37px] left-[76px] h-[15px] w-[90px] rotate-[3deg] rounded-full bg-gradient-to-r from-[#171c21] to-[#555f68]" />
                </div>
              </div>

              {/* BOTTOM INFO */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
                    Last Care
                  </p>

                  <p className="mt-1.5 text-sm font-semibold">
                    {loading
                      ? "—"
                      : firstMotorLastCare
                        ? formatMonthDay(
                            firstMotorLastCare.date,
                          )
                        : "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
                    Next
                  </p>

                  <p className="mt-1.5 text-sm font-semibold">
                    {loading
                      ? "—"
                      : firstMotorNextSchedule
                        ? formatMonthDay(
                            firstMotorNextSchedule.next_date,
                          )
                        : "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3.5">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-white/25">
                    Status
                  </p>

                  <p className="mt-1.5 text-sm font-semibold text-emerald-300">
                    {firstMotor
                      ? getStatusLabel(firstMotor)
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <section className="px-5 pb-4 sm:px-7 lg:px-10">
          <div className="mx-auto max-w-[1400px] rounded-2xl border border-red-400/10 bg-red-400/[0.04] px-5 py-4">
            <p className="text-xs font-medium text-red-300">
              Public data unavailable
            </p>

            <p className="mt-1 text-[11px] text-red-200/40">
              {error}
            </p>
          </div>
        </section>
      )}

      {/* SERVICES */}
      <section className="border-y border-white/[0.06] bg-[#090c10]">
        <div className="mx-auto max-w-[1400px] px-5 py-16 sm:px-7 lg:px-10">
          <div className="mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300/70">
              What we track
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Everything your ride needs.
            </h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                number: "01",
                title: "Maintenance",
                text: "Catat setiap cuci dan perawatan motor.",
              },
              {
                number: "02",
                title: "Schedule",
                text: "Jadwal rutin supaya tidak ada yang terlewat.",
              },
              {
                number: "03",
                title: "Payment",
                text: "Riwayat pembayaran tersimpan dengan rapi.",
              },
              {
                number: "04",
                title: "Inventory",
                text: "Pantau stok produk dan alat yang digunakan.",
              },
            ].map((item) => (
              <div
                key={item.number}
                className="group rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 transition duration-300 hover:-translate-y-1 hover:border-blue-300/15 hover:bg-white/[0.035]"
              >
                <span className="text-[11px] font-semibold tracking-[0.15em] text-blue-300/50">
                  {item.number}
                </span>

                <h3 className="mt-12 text-lg font-semibold">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/35">
                  {item.text}
                </p>

                <div className="mt-7 h-px w-full bg-white/[0.06] transition group-hover:bg-blue-300/20" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MOTOR */}
      <section
        id="motor"
        className="mx-auto max-w-[1400px] px-5 py-20 sm:px-7 lg:px-10 lg:py-24"
      >
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300/70">
              My Garage
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Your motorcycles.
            </h2>

            <p className="mt-3 max-w-lg text-sm leading-6 text-white/35">
              Semua motor dalam satu tempat, lengkap dengan status
              dan perawatan terakhir.
            </p>
          </div>

          <span className="w-fit rounded-full border border-white/[0.1] bg-white/[0.025] px-5 py-2.5 text-[12px] font-semibold text-white/40">
            {loading
              ? "Loading..."
              : `${motors.length} public motor${
                  motors.length === 1 ? "" : "s"
                }`}
          </span>
        </div>

        {loading ? (
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {[1, 2].map((item) => (
              <div
                key={item}
                className="h-[410px] animate-pulse rounded-[28px] border border-white/[0.06] bg-white/[0.018]"
              />
            ))}
          </div>
        ) : motors.length === 0 ? (
          <div className="mt-10 rounded-[28px] border border-dashed border-white/[0.08] bg-white/[0.018] px-6 py-16 text-center">
            <p className="text-sm font-semibold text-white/60">
              No public motorcycles yet.
            </p>

            <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-white/25">
              Motor yang ditandai sebagai public dari dashboard
              admin akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {motors.map((motor, index) => {
              const lastMaintenance = getLastMaintenance(
                motor.id,
              );

              const schedule = getNextSchedule(motor.id);

              return (
                <div
                  key={motor.id}
                  className="group relative overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#11161c] to-[#0a0d11] p-6 transition duration-300 hover:border-white/[0.13] sm:p-7"
                >
                  <div className="absolute right-[-80px] top-[-100px] h-[260px] w-[260px] rounded-full bg-blue-400/[0.04] blur-[70px]" />

                  <div className="relative flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/25">
                          Motor{" "}
                          {String(index + 1).padStart(2, "0")}
                        </span>

                        <span className="h-1 w-1 rounded-full bg-white/20" />

                        <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/25">
                          {getMotorType(motor)}
                        </span>
                      </div>

                      <h3 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">
                        {getMotorLabel(motor)}
                      </h3>

                      <p className="mt-1 font-mono text-xs text-white/30">
                        {motor.plate_number || "Plate not set"}
                      </p>
                    </div>

                    <span className="shrink-0 rounded-full border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-emerald-300">
                      {getStatusLabel(motor)}
                    </span>
                  </div>

                  <div className="relative mt-10 flex h-[170px] items-center justify-center">
                    <div className="absolute h-[150px] w-[150px] rounded-full bg-blue-400/[0.035] blur-2xl" />

                    <div className="relative h-[80px] w-[230px]">
                      <div className="absolute bottom-0 left-2 h-[58px] w-[30px] rounded-full border-[5px] border-[#3b444d] bg-[#080a0c]" />

                      <div className="absolute bottom-0 right-2 h-[58px] w-[30px] rounded-full border-[5px] border-[#3b444d] bg-[#080a0c]" />

                      <div className="absolute left-[45px] top-[18px] h-[48px] w-[135px] rotate-[-4deg] rounded-[50%] bg-gradient-to-br from-[#3c4650] to-[#171c22]" />

                      <div className="absolute left-[86px] top-[1px] h-[42px] w-[52px] rounded-[50%] bg-[#313a43]" />

                      <div className="absolute right-[22px] top-[25px] h-[8px] w-[25px] rounded-full bg-blue-300/70 shadow-[0_0_18px_rgba(96,165,250,0.55)]" />

                      <div className="absolute left-[57px] top-[48px] h-[2px] w-[94px] bg-blue-400/40" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-white/[0.06] bg-black/15 p-4">
                      <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">
                        Last Maintenance
                      </p>

                      <p className="mt-1.5 text-sm font-semibold">
                        {lastMaintenance
                          ? formatDate(lastMaintenance.date)
                          : "No record"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/[0.06] bg-black/15 p-4">
                      <p className="text-[9px] uppercase tracking-[0.16em] text-white/25">
                        Next Schedule
                      </p>

                      <p className="mt-1.5 text-sm font-semibold">
                        {schedule
                          ? formatDate(schedule.next_date)
                          : "No schedule"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ACTIVITY */}
      <section
        id="activity"
        className="border-y border-white/[0.06] bg-[#090c10]"
      >
        <div className="mx-auto max-w-[1400px] px-5 py-20 sm:px-7 lg:px-10 lg:py-24">
          <div className="grid gap-14 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300/70">
                Activity
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
                Recent care.
              </h2>

              <p className="mt-4 max-w-md text-sm leading-7 text-white/35">
                Riwayat perawatan terbaru dari seluruh motor yang
                terdaftar di MotorCare.
              </p>

              <a
                href="#motor"
                className="mt-7 inline-flex text-[12px] font-semibold text-white/60 transition hover:text-white"
              >
                See my motorcycles →
              </a>
            </div>

            <div className="overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.018]">
              {loading ? (
                <div className="divide-y divide-white/[0.06]">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="h-[115px] animate-pulse bg-white/[0.01]"
                    />
                  ))}
                </div>
              ) : publicActivities.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <p className="text-sm font-semibold text-white/50">
                    No activity yet.
                  </p>

                  <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-white/25">
                    Riwayat perawatan dari motor public akan muncul
                    otomatis di sini.
                  </p>
                </div>
              ) : (
                publicActivities.map((activity, index) => {
                  const motor = motors.find(
                    (item) => item.id === activity.motor_id,
                  );

                  const title = getActivityTitle(
                    activity,
                    schedules,
                  );

                  const detail = getActivityDetail(
                    activity,
                    schedules,
                  );

                  const status =
                    activity.status || "Completed";

                  return (
                    <div
                      key={activity.id}
                      className={`grid gap-5 p-5 sm:grid-cols-[80px_1fr_auto] sm:items-center sm:p-6 ${
                        index !== publicActivities.length - 1
                          ? "border-b border-white/[0.06]"
                          : ""
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold">
                          {formatMonthDay(activity.date)}
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-white/25">
                          {new Date(
                            `${activity.date}T00:00:00`,
                          ).getFullYear()}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-semibold">
                          {title}
                        </h3>

                        <p className="mt-1 text-xs text-white/40">
                          {motor
                            ? getMotorLabel(motor)
                            : "Motorcycle"}
                        </p>

                        <p className="mt-2 line-clamp-2 text-[11px] text-white/25">
                          {detail}
                        </p>
                      </div>

                      <span
                        className={`w-fit rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.1em] ${getStatusClass(
                          status,
                        )}`}
                      >
                        {status}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* UPCOMING */}
      <section className="mx-auto max-w-[1400px] px-5 py-16 sm:px-7 lg:px-10 lg:py-20">
        <div className="grid gap-4 lg:grid-cols-[1fr_1.5fr]">
          <div className="rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#11171e] to-[#090c10] p-7">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300/70">
              Upcoming
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.035em]">
              Next care.
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-white/30">
              Jadwal perawatan berikutnya yang sudah dibuat dari
              dashboard MotorCare.
            </p>
          </div>

          <div className="overflow-hidden rounded-[28px] border border-white/[0.07] bg-white/[0.018]">
            {loading ? (
              <div className="h-[150px] animate-pulse bg-white/[0.01]" />
            ) : nextSchedule.length === 0 ? (
              <div className="flex min-h-[150px] items-center px-6">
                <p className="text-sm text-white/30">
                  Belum ada jadwal aktif.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {nextSchedule.slice(0, 3).map((schedule) => {
                  const motor = motors.find(
                    (item) => item.id === schedule.motor_id,
                  );

                  return (
                    <div
                      key={schedule.id}
                      className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
                    >
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {motor
                            ? getMotorLabel(motor)
                            : "Motorcycle"}
                        </p>

                        <p className="mt-1 text-xs text-white/30">
                          {schedule.service_type ||
                            "Motor Care"}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-sm font-semibold">
                          {formatDate(schedule.next_date)}
                        </p>

                        <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-blue-300/50">
                          {schedule.frequency.replaceAll(
                            "_",
                            " ",
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="mx-auto max-w-[1400px] px-5 py-20 sm:px-7 lg:px-10 lg:py-28"
      >
        <div className="relative overflow-hidden rounded-[32px] border border-white/[0.07] bg-gradient-to-br from-[#11171e] via-[#0b0f14] to-[#080a0d] p-7 sm:p-10 lg:p-14">
          <div className="absolute right-[-100px] top-[-150px] h-[350px] w-[350px] rounded-full bg-blue-400/[0.06] blur-[100px]" />

          <div className="relative grid gap-12 lg:grid-cols-[1fr_.8fr] lg:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300/70">
                About MotorCare
              </p>

              <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.045em] sm:text-5xl">
                Small care,
                <br />
                <span className="text-white/35">
                  better rides.
                </span>
              </h2>

              <p className="mt-6 max-w-2xl text-sm leading-7 text-white/40">
                MotorCare dibuat untuk membuat perawatan motor
                sehari-hari lebih teratur. Bukan sekadar mencuci
                motor, tetapi juga menyimpan jadwal, riwayat,
                pembayaran, dan penggunaan produk secara rapi.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-5">
                <p className="text-2xl font-semibold">
                  {String(motors.length).padStart(2, "0")}
                </p>

                <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-white/25">
                  Public Motors
                </p>
              </div>

              <div className="rounded-2xl border border-white/[0.07] bg-black/15 p-5">
                <p className="text-2xl font-semibold">
                  {String(activities.length).padStart(2, "0")}
                </p>

                <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-white/25">
                  Care Records
                </p>
              </div>

              <div className="col-span-2 rounded-2xl border border-blue-300/10 bg-blue-300/[0.025] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-300/60">
                  CLEAN RIDE • BETTER JOURNEY
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 sm:px-7 lg:px-10 lg:pb-24">
        <div className="mx-auto max-w-[1400px]">
          <div className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.025] px-7 py-12 text-center sm:px-10 sm:py-16">
            <div className="absolute left-1/2 top-[-100px] h-[250px] w-[500px] -translate-x-1/2 rounded-full bg-blue-400/[0.07] blur-[90px]" />

            <div className="relative">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300/70">
                MotorCare System
              </p>

              <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Keep every ride
                <br />
                <span className="text-white/35">
                  in good shape.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-lg text-sm leading-6 text-white/35">
                Semua catatan perawatan motor tersimpan rapi dan
                mudah dipantau kapan saja.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <a
                  href="#motor"
                  className="inline-flex rounded-full bg-white px-7 py-3.5 text-[12px] font-semibold text-[#080a0d] transition hover:bg-blue-100"
                >
                  View motorcycles
                </a>

                <a
                  href="#home"
                  className="inline-flex rounded-full border border-white/[0.1] bg-white/[0.025] px-7 py-3.5 text-[12px] font-semibold text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                >
                  Back to top ↑
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.07]">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-5 px-5 py-8 sm:px-7 md:flex-row md:items-center md:justify-between lg:px-10">
          <div className="flex items-center gap-4">
            <Image
              src="/motorcare-logo.png"
              alt="MotorCare"
              width={120}
              height={36}
              className="h-auto w-[82px] object-contain opacity-70"
            />

            <span className="h-4 w-px bg-white/[0.1]" />

            <p className="text-[11px] text-white/25">
              Motorcycle care management.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[9px] uppercase tracking-[0.14em] text-white/15">
              {realtimeStatus === "live"
                ? "Live Database"
                : "MotorCare"}
            </span>

            <p className="text-[10px] uppercase tracking-[0.14em] text-white/20">
              © 2026 MotorCare
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}