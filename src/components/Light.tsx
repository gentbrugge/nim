type Props = {
  on: boolean;
};

function Light ({ on }: Props) {
  return (
    <div
      style={{
        width: '20px',
        height: '20px',
        borderRadius: '2px',
        background: on ? 'red' : 'grey'
      }}
    />
  );
}

export default Light;