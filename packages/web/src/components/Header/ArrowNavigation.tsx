import { Button, Tooltip } from '@fluentui/react-components';
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
      <Tooltip content={'Go Back'} relationship="label" showDelay={1500}>
        <Button size="small" appearance="transparent" icon={<ChevronLeftRegular fontSize={20} />} onClick={handleBack} />
      </Tooltip>
      <Tooltip content={'Go Forward'} relationship="label" showDelay={1500}>
        <Button size="small" appearance="transparent" icon={<ChevronRightRegular fontSize={20} />} onClick={handleForward} />
      </Tooltip>
    </div>
  );
};

export default ArrowNavigation;
