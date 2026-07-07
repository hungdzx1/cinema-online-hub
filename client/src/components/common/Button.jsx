
import './common.css';

export const Button = ({ children, variant = 'primary', className = '', icon, onClick, ...props }) => {
  return (
    <button 
      className={`btn btn-${variant} ${className}`} 
      onClick={onClick}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {children}
    </button>
  );
};
