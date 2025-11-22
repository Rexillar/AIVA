import { useSelector, useDispatch } from 'react-redux';
import { hideRewards } from '../../redux/slices/gamificationSlice';
import Card from '../shared/Card';
import Button from '../shared/Button';

const RewardsNotification = () => {
  const dispatch = useDispatch();
  const { showRewards, lastRewards } = useSelector(state => state.gamification);

  if (!showRewards || !lastRewards) return null;

  const { xp, coins, newAchievements = [] } = lastRewards;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="max-w-md w-full mx-4">
        <div className="text-center p-6">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-4">Congratulations!</h2>

          <div className="space-y-3 mb-6">
            {xp > 0 && (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">+{xp} XP</span>
                <span className="text-green-600">⭐</span>
              </div>
            )}

            {coins > 0 && (
              <div className="flex items-center justify-center space-x-2">
                <span className="text-lg">+{coins} Coins</span>
                <span className="text-yellow-600">🪙</span>
              </div>
            )}

            {newAchievements.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">New Achievements!</h3>
                {newAchievements.map((achievement, index) => (
                  <div key={index} className="flex items-center space-x-2 text-sm">
                    <span>{achievement.icon}</span>
                    <span>{achievement.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            onClick={() => dispatch(hideRewards())}
            className="w-full"
          >
            Continue
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default RewardsNotification;