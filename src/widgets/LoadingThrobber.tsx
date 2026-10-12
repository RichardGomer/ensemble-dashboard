import React from 'react';

const LoadingThrobber: React.FC = () => {
	return (
		<span
			aria-label="Loading"
			role="status"
			style={{
				display: 'inline-block',
				width: 18,
				height: 18,
				border: '2px solid rgba(255, 255, 255, 0.35)',
				borderTopColor: '#ffffff',
				borderRadius: '50%',
				animation: 'loading-throbber-spin 0.7s linear infinite',
			}}
		>
			<style>
				{`@keyframes loading-throbber-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
			</style>
		</span>
	);
};

export default LoadingThrobber;
