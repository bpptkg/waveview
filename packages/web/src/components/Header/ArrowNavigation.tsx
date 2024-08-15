import { Button } from '@fluentui/react-components';
import { ChevronLeftRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { useNavigate } from 'react-router-dom';

const ArrowNavigation = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleForward = () => {
    navigate(1);
  };

  return (
    <div>
      <Button size="small" appearance="transparent" icon={<ChevronLeftRegular fontSize={20} />} onClick={handleBack} />
      <Button size="small" appearance="transparent" icon={<ChevronRightRegular fontSize={20} />} onClick={handleForward} />
    </div>
  );
};

export default ArrowNavigation;
