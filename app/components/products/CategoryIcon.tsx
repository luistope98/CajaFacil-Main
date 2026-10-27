import LocalBarOutlinedIcon from "@mui/icons-material/LocalBarOutlined";
import BakeryDiningOutlinedIcon from "@mui/icons-material/BakeryDiningOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import CookieOutlinedIcon from "@mui/icons-material/CookieOutlined";
import LocalDiningOutlinedIcon from "@mui/icons-material/LocalDiningOutlined";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";
import GrassIcon from '@mui/icons-material/Grass';
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import { SxProps, Theme } from "@mui/material";

interface Props {
  name: string;
  sx?: SxProps<Theme>;
}

export default function CategoryIcon({ name, sx: customSx }: Props) {
  const defaultSx = { fontSize: 22, opacity: 0.95, ...customSx };
  const label = name?.toLowerCase() || "";

  if (label.includes("bebida") || label.includes("jugo") || label.includes("drink") || label.includes("licor")) 
    return <LocalBarOutlinedIcon sx={defaultSx} />;
  
  if (label.includes("pan") || label.includes("bakery") || label.includes("repostería")) 
    return <BakeryDiningOutlinedIcon sx={defaultSx} />;
  
  if (label.includes("carne") || label.includes("pollo") || label.includes("food") || label.includes("comida")) 
    return <RestaurantOutlinedIcon sx={defaultSx} />;
  
  if (label.includes("dulce") || label.includes("galleta") || label.includes("postre") || label.includes("candy")) 
    return <CookieOutlinedIcon sx={defaultSx} />;
  
  if (label.includes("fruta") || label.includes("verdura") || label.includes("vegetal") || label.includes("natural")) 
    return <GrassIcon sx={defaultSx} />;

  if (label.includes("herramienta") || label.includes("taller") || label.includes("ferretería")) 
    return <HandymanOutlinedIcon sx={defaultSx} />;

  if (label.includes("snack") || label.includes("mecato") || label.includes("paquete")) 
    return <LocalDiningOutlinedIcon sx={defaultSx} />;

  return <Inventory2OutlinedIcon sx={defaultSx} />;
}