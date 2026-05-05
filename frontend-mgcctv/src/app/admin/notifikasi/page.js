"use client";

import { useNotifikasi } from "@/hooks/admin/notifikasi/useNotifikasi";
import UnreadNotifikasiSection from "@/section/admin/notifikasi/UnreadNotifikasiSection";
import ReadNotifikasiSection from "@/section/admin/notifikasi/ReadNotifikasiSection";

export default function NotificationPage() {
  const { unreadNotifs, readNotifs, handleMarkAllRead, handleRead, getStyleByType } = useNotifikasi();

  return (
    <div className="p-5 md:p-8 w-full max-w-10xl mx-auto">
      
      {/* SECTION: BELUM DIBACA */}
      <UnreadNotifikasiSection 
        unreadNotifs={unreadNotifs} 
        handleMarkAllRead={handleMarkAllRead} 
        handleRead={handleRead}
        getStyleByType={getStyleByType} 
      />

      {/* PEMISAH */}
      <div className="border-t border-slate-200 border-dashed my-6"></div>

      {/* SECTION: SUDAH DIBACA */}
      <ReadNotifikasiSection 
        readNotifs={readNotifs} 
        handleRead={handleRead}
        getStyleByType={getStyleByType} 
      />

    </div>
  );
}
