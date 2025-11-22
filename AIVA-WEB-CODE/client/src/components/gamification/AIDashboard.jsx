import { useGetUserStatsQuery } from '../../redux/slices/gamificationApiSlice';
import Card from '../shared/Card';

const AIDashboard = () => {
  const { data: stats, isLoading } = useGetUserStatsQuery();

  if (isLoading) return <div>Loading AI insights...</div>;

  // Mock AI suggestions - in real implementation, this would come from AI service
  const suggestions = [
    "Based on your focus patterns, try the Pomodoro technique for deep work sessions.",
    "Your habit streak is strong! Consider adding a new learning habit.",
    "Tasks with 'deep-work' focus tag perform better when scheduled in morning hours.",
    "You've completed 5 tasks this week - great progress! Aim for 7 next week."
  ];

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-3">AI Insights</h3>
        <div className="space-y-2">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start space-x-2">
              <span className="text-blue-500 mt-1">💡</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
            </div>
          ))}
        </div>
      </Card>

      {stats && (
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-3">Focus Recommendations</h3>
          <div className="space-y-2 text-sm">
            <p>🎯 <strong>Next Focus Session:</strong> 25-minute deep work block</p>
            <p>📊 <strong>Productivity Score:</strong> {Math.floor((stats.xp / (stats.level * 100)) * 100)}%</p>
            <p>🔥 <strong>Streak Bonus:</strong> {stats.streakData?.currentStreak > 0 ? `${stats.streakData.currentStreak}x multiplier` : 'Start a streak!'}</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AIDashboard;