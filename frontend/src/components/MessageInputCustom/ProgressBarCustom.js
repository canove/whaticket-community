import * as React from 'react';
import LinearProgress, { LinearProgressProps } from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';

function LinearProgressWithLabel(props) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} style={{position: 'initial', backgroundColor: 'mediumseagreen' }} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary" style={{ color: '#fff',position: 'absolute'}}>{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

export default function LinearWithValueLabel({progress}) {
  //const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    /*const timer = setInterval(() => {
      setProgress((prevProgress) => (prevProgress >= 99 ? 99 : prevProgress + 10));
    }, 420);
    return () => {
      clearInterval(timer);
    };*/
  }, [progress]);

  return (
    <Box sx={{ width: '100%' }} >
      <LinearProgressWithLabel value={progress} style={{height: 50}}/>
    </Box>
  );
}