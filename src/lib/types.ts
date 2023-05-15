export type NavigationNode = {
	slug: string;
	title: string;
	path: string;
	parent: string;
	children?: NavigationNode[];
	url?: string;
};
