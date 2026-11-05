import { useEffect, useState } from 'react';

export default function SmartImage({
  src,
  alt,
  className = '',
  loading = 'lazy',
  decoding = 'async',
  ...rest
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <img
      src={failed || !src ? '/placeholder.svg' : src}
      alt={alt}
      loading={loading}
      decoding={decoding}
      onError={() => setFailed(true)}
      className={className}
      {...rest}
    />
  );
}
