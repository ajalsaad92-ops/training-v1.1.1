import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Bell, Volume2, Vibrate, MonitorSmartphone, Send } from "lucide-react";
import {
  getNotificationSettings, setNotificationSettings, type NotificationSettings,
} from "@/lib/notificationSettings";
import { alertUser, requestNotificationPermission } from "@/lib/notify";

const Row = ({
  icon: Icon, title, desc, checked, disabled, onChange,
}: {
  icon: React.ElementType; title: string; desc: string;
  checked: boolean; disabled?: boolean; onChange: (v: boolean) => void;
}) => (
  <div className={`flex items-center justify-between gap-3 rounded-lg border border-border p-3 ${disabled ? "opacity-50" : ""}`}>
    <div className="flex items-start gap-2.5">
      <Icon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
      <div>
        <p className="text-xs font-bold text-foreground">{title}</p>
        <p className="text-[10px] text-muted-foreground">{desc}</p>
      </div>
    </div>
    <Switch checked={checked} disabled={disabled} onCheckedChange={onChange} />
  </div>
);

const NotificationsControl = () => {
  const [s, setS] = useState<NotificationSettings>(() => getNotificationSettings());

  const update = (patch: Partial<NotificationSettings>) => {
    const next = setNotificationSettings(patch);
    setS({ ...next });
  };

  const testNotification = async () => {
    if (!s.enabled) { toast({ title: "الإشعارات معطّلة", description: "فعّل الإشعارات أولاً", variant: "destructive" }); return; }
    if (s.system) await requestNotificationPermission();
    alertUser("إشعار تجريبي", "هذا اختبار للتأكد من أن الإشعارات تعمل بشكل صحيح ✅");
    toast({ title: "تم إرسال إشعار تجريبي", description: "تحقق من الصوت والاهتزاز والإشعار" });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
        <Bell className="w-4 h-4 text-primary" />إعدادات الإشعارات
      </h3>
      <p className="text-[11px] text-muted-foreground">
        تتحكم هذه الإعدادات بجميع الإشعارات والتنبيهات داخل التطبيق (الصوت، الاهتزاز، إشعارات النظام).
      </p>

      <Row
        icon={Bell}
        title="تفعيل الإشعارات"
        desc="المفتاح الرئيسي — عند الإيقاف لن يصلك أي تنبيه"
        checked={s.enabled}
        onChange={(v) => update({ enabled: v })}
      />
      <Row
        icon={Volume2}
        title="الصوت"
        desc="تشغيل نغمة عند وصول إشعار جديد"
        checked={s.sound}
        disabled={!s.enabled}
        onChange={(v) => update({ sound: v })}
      />
      <Row
        icon={Vibrate}
        title="الاهتزاز"
        desc="اهتزاز الجهاز عند وصول إشعار (الهاتف)"
        checked={s.vibration}
        disabled={!s.enabled}
        onChange={(v) => update({ vibration: v })}
      />
      <Row
        icon={MonitorSmartphone}
        title="إشعارات النظام"
        desc="إظهار إشعار على مستوى النظام حتى عند تصغير التطبيق"
        checked={s.system}
        disabled={!s.enabled}
        onChange={async (v) => { if (v) await requestNotificationPermission(); update({ system: v }); }}
      />

      <Button size="sm" className="gap-1.5" onClick={testNotification}>
        <Send className="w-3.5 h-3.5" />إرسال إشعار تجريبي
      </Button>
    </div>
  );
};

export default NotificationsControl;
