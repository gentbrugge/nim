type Props = {
  active: boolean;
  onClick: () => void;
};

function NextButton ({ active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '18px',
        height: '18px',
        border: '2px solid #00000FF',
        padding: 0,
        borderRadius: '9px',
        outline: 0,
        background: active ? 'blue' : 'grey'
      }}
    />
  );
}

export default NextButton;