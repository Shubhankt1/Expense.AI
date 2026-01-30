import { PureComponent } from "react";

export class NavigationTab {
	constructor(
		public readonly id: string,
		public readonly label: string,
		public readonly icon: string,
	) {}
}

interface NavigationTabsProps {
	tabs: NavigationTab[];
	activeTab: string;
	onChange: (tabId: string) => void;
}

export class NavigationTabs extends PureComponent<NavigationTabsProps> {
	private handleChange = (tabId: string) => {
		this.props.onChange(tabId);
	};

	render() {
		const { tabs, activeTab } = this.props;

		return (
			<div className="flex space-x-1 mb-4 bg-slate-100 p-2 rounded-3xl overflow-x-auto">
				{tabs.map((tab) => (
					<button
						key={tab.id}
						onClick={() => this.handleChange(tab.id)}
						className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-sm font-medium transition-colors whitespace-nowrap ${
							activeTab === tab.id
								? "bg-white text-emerald-700 shadow-sm"
								: "text-slate-600 hover:text-slate-900"
						}`}
					>
						<span>{tab.icon}</span>
						<span>{tab.label}</span>
					</button>
				))}
			</div>
		);
	}
}
