import CycleCalendar from '../components/CycleCalendar';
import InputForm from '../components/InputForm';
import PhaseGuide from '../components/PhaseGuide';
import ResultCard from '../components/ResultCard';

export default function MainPage() {
  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <InputForm />
        <ResultCard />
      </div>

      <CycleCalendar />

      <PhaseGuide />
    </>
  );
}
