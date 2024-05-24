type Props = {
  on: boolean;
};

function Light ({ on }: Props) {
  return <div style={{width: '20px', height: '20px', background: on ? 'red' : 'grey'}} />
}

export default Light;