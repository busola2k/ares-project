enyo.kind({
	name: "DocumentToolbar",
	kind: "onyx.MoreToolbar",
	events: {
		onGrabberTap: "",
		onSwitchFile: "",
		onClose: "",
		onSave: "",
		onNewKind: "",
		onDesign: "",
	},
	components: [
		{kind: "onyx.Grabber", ontap: "doGrabberTap"},
		{kind: "onyx.Drawer", classes: "ares-filedrawer", orient: "h", open: false, components: [
			{kind: "FittableColumns", components: [
				{kind: "onyx.Button", content: "Save", ontap: "doSave"},
				{kind: "onyx.Button", content: "New Kind", ontap: "doNewKind"},
				{kind: "onyx.Button", content: "Designer", ontap: "doDesign"}
			]}
		]},
		{fit: true},
		{name: "tabs", classes: "ares-docbar-tabs", kind: "onyx.RadioGroup"}
	],
	documents: [],
	showControls: function() {
		this.$.drawer.setOpen(true);
	},
	hideControls: function() {
		this.$.drawer.setOpen(false);
	},
	createFileTab: function(file) {
		this.$.tabs.createComponent({
			classes: "onyx-button ares-tab-button",
			file: file,
			components: [
	    		{content: file.name},
				{kind: "onyx.IconButton", src: "$lib/onyx/images/progress-button-cancel.png", ontap: "closeFile"},
			],
			ontap: "switchFile"
		}, {owner: this}).render();;
		this.reflow();
	},
	switchFile: function(inSender, inEvent) {
		this.doSwitchFile({file: inSender.file});
	},
	closeFile: function(inSender, inEvent) {
		inSender.parent.destroy();
	}
});
