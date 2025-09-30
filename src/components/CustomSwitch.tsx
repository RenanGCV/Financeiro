import React from 'react';
import Switch from 'react-switch';

interface CustomSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const CustomSwitch: React.FC<CustomSwitchProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'medium'
}) => {
  const sizeConfig = {
    small: { height: 20, width: 40, handleDiameter: 16 },
    medium: { height: 24, width: 48, handleDiameter: 20 },
    large: { height: 28, width: 56, handleDiameter: 24 }
  };

  const config = sizeConfig[size];

  return (
    <div className="flex items-center space-x-3">
      <Switch
        onChange={onChange}
        checked={checked}
        disabled={disabled}
        onColor="#10B981"
        onHandleColor="#FFFFFF"
        offColor="#E5E7EB"
        offHandleColor="#FFFFFF"
        handleDiameter={config.handleDiameter}
        uncheckedIcon={false}
        checkedIcon={false}
        boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
        activeBoxShadow="0px 0px 1px 10px rgba(16, 185, 129, 0.2)"
        height={config.height}
        width={config.width}
        className="react-switch"
      />
      <label className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'} select-none cursor-pointer`}>
        {label}
      </label>
    </div>
  );
};
