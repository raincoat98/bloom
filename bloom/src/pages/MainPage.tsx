import CycleCalendar from '../components/CycleCalendar';
import InputForm from '../components/InputForm';
import NotificationBanner from '../components/NotificationBanner';
import NotificationSettings from '../components/NotificationSettings';
import PhaseGuide from '../components/PhaseGuide';
import ResultCard from '../components/ResultCard';

export default function MainPage() {
  return (
    <div className="space-y-6">
      <NotificationBanner />

      <div className="grid gap-6 lg:grid-cols-2">
        <InputForm />
        <ResultCard />
      </div>

      <NotificationSettings compact />

      <CycleCalendar />

      <PhaseGuide />
    </div>
  );
}
