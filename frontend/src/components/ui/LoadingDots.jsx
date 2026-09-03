export default function LoadingDots({ color = '#19C463', size = 8 }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: color,
            display: 'inline-block',
            animation: 'dotPulse 1.4s infinite ease-in-out',
            animationDelay: `${i * 0.16}s`,
          }}
        />
      ))}
    </span>
  );
}
