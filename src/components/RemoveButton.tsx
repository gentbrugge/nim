type Props = {
  active: boolean;
  onClick: () => void;
};

function RemoveButton ({ active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '18px',
        height: '18px',
        border: '2px solid #00000FF',
        padding: 0,
        borderRadius: '9px',
        background: active ? 'orange' : 'grey'
      }}
    />
  );
}

export default RemoveButton;