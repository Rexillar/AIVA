import { useGetUserStatsQuery } from '../../redux/slices/gamificationApiSlice';
import Card from '../shared/Card';
import ProgressBar from '../shared/ProgressBar';

const GamificationStats = () => {
  const { data: stats, isLoading, error } = useGetUserStatsQuery();

  if (isLoading) return <div>Loading stats...</div>;
  if (error) return <div>Error loading stats</div>;
  if (!stats) return null;

  const { xp, coins, level, tier, xpProgress, xpToNext, progressPercent, totalFocusTime } = stats;

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">Progress & Rewards</h3>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{level}</div>
          <div className="text-sm text-gray-600">Level</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{tier}</div>
          <div className="text-sm text-gray-600">Tier</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>XP Progress</span>
          <span>{xpProgress}/{xpToNext}</span>
        </div>
        <ProgressBar progress={progressPercent} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-xl font-semibold text-green-600">{xp}</div>
          <div className="text-sm text-gray-600">Total XP</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold text-purple-600">{coins}</div>
          <div className="text-sm text-gray-600">Coins</div>
        </div>
      </div>

      <div className="text-center">
        <div className="text-lg font-semibold text-indigo-600">{Math.floor(totalFocusTime / 60)}h {totalFocusTime % 60}m</div>
        <div className="text-sm text-gray-600">Focus Time</div>
      </div>
    </Card>
  );
};

export default GamificationStats;