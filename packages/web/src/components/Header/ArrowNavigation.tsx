import { Button } from '@fluentui/react-components';
import { ChevronLeft20Regular, ChevronRight20Regular } from '@fluentui/react-icons';

const ArrowNavigation = () => {
  return (
    <div>
      <Button size="small" appearance='transparent' icon={<ChevronLeft20Regular />} />
      <Button size="small" appearance='transparent' icon={<ChevronRight20Regular />} />
    </div>
  );
};

export default ArrowNavigation;
