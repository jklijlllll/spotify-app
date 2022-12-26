import LinearProgress, {
  LinearProgressProps,
} from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export function LinearProgressWithLabel(
  props: LinearProgressProps & {
    value: number;
    min: number;
    max: number;
    postFix?: string;
  }
) {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Box sx={{ width: "100%", mr: 1 }}>
        <LinearProgress
          variant="determinate"
          value={
            Math.abs((props.value - props.min) / (props.max - props.min)) * 100
          }
        />
      </Box>
      <Box sx={{ width: 35 }}>
        <Typography
          sx={{ fontSize: 12 }}
          variant="body2"
          color="text.secondary"
        >{`${props.value + (props.postFix ? props.postFix : "")}`}</Typography>
      </Box>
    </Box>
  );
}
