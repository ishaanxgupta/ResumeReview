interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <div className="min-h-screen w-full bg-black flex items-center justify-center">
    <div className={`flex items-center justify-center ${className}`}>
      <div 
        className={`spinner-gradient ${sizeClasses[size]} animate-spin`}
        style={{
          background: 'linear-gradient(45deg, rgb(186, 66, 255) 35%, rgb(0, 225, 255))',
          borderRadius: '50%',
          filter: 'blur(1px)',
          boxShadow: '0px -5px 20px 0px rgb(186, 66, 255), 0px 5px 20px 0px rgb(0, 225, 255)',
          position: 'relative'
        }}
      >
        <div 
          className="spinner-inner"
          style={{
            backgroundColor: 'rgb(36, 36, 36)',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            filter: 'blur(10px)',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      </div>
    </div>
    </div>
  );
}
