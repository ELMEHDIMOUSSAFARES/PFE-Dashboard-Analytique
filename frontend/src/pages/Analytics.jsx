import SalesChart from '../components/SalesChart';
import DonutChart from '../components/DonutChart';

export default function Analytics() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Track your performance</p>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SalesChart />
        <DonutChart />
      </div>
    </div>
  );
}