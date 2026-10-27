'use client';
import { useRef, useEffect, useState } from 'react';

const AnimateOnScroll = ({
	children,
	className = '',
	animation = 'animate-fade-in-up',
	delay = 0,
	threshold = 0.12,
	tag: Tag = 'div',
	style = {},
	...rest
}) => {
	const ref = useRef(null);
	const [visible, setVisible] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setVisible(true);
					observer.unobserve(el);
				}
			},
			{ threshold }
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, [threshold]);

	return (
		<Tag
			ref={ref}
			className={`${visible ? animation : 'opacity-0'} ${className}`}
			style={{ ...style, ...(delay ? { animationDelay: `${delay}ms` } : {}) }}
			{...rest}
		>
			{children}
		</Tag>
	);
};

export default AnimateOnScroll;
