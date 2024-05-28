import * as ICONS_MD from 'react-icons/md';
import * as ICONS_LU from "react-icons/lu"

type IconNamesMD = keyof typeof ICONS_MD;
type IconNamesLU = keyof typeof ICONS_LU;

type IconNames = IconNamesMD | IconNamesLU;

type typesPropsIcon = {
  nameIcon: IconNames;
  propsIcon?: any;
};

export function Icon({ nameIcon, propsIcon }: typesPropsIcon): JSX.Element {
 
  let IconComponent;

  if (nameIcon in ICONS_MD) {
    IconComponent = ICONS_MD[nameIcon as IconNamesMD];
  } else if (nameIcon in ICONS_LU) {
    IconComponent = ICONS_LU[nameIcon as IconNamesLU];
  }

  if (!IconComponent) {
    return <p>{nameIcon}</p>;
  }

  return <IconComponent {...propsIcon} />
}
