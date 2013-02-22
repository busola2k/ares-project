enyo.kind({
	name: "ComponentView",
	events: {
		onSelect: "",
		onHighlightDropTarget: "",
		onUnHighlightDropTargets: "",
		onDrop: "",
		onPaletteDrop: ""
	},
	style: "position: relative;",
	components: [
		{kind: "Scroller", classes: "enyo-fit", components: [
			{name: "client", style: "padding: 8px;"}
		]}
	],
	indent: 32,
	containerData: null,
	
	rendered: function() {
		this.inherited(arguments);
		this.getContainerData();
	},
	getContainerData: function() {
		this.containerData = Model.getFlattenedContainerInfo();
	},
	
	//* Draw component view visualization of component tree
	visualize: function(inComponents) {
		this.map = {};
		this.destroyClientControls();
		this._visualize(inComponents, 0);
		this.render();
	},
	//* Create an entry in the component view
	createEntry: function(inComponent, inIndent) {
		this.map[inComponent.name] = this.createComponent(
			{comp: inComponent, style: "padding-left: " + inIndent + "px;", attributes: {draggable: "true"},
				ondown: "itemDown", ondragstart: "itemDragstart", ondragover: "itemDragover", ondragleave: "itemDragleave", ondrop: "itemDrop",
				components: [
					{tag: "b", content: inComponent.name, style: "pointer-events: none;"},
					{tag: "span", allowHtml: true, style: "pointer-events: none;", content: "&nbsp;(<i>" + inComponent.kind + "</i>)"}
				]
			}
		);
		
		// Set _dropTarget_ attribute based on _this.containerData_
		this.map[inComponent.name].setAttribute("dropTarget", this.containerData[inComponent.kind] !== false);
	},
	//* Create component view representation of designer
	_visualize: function(inComponents, inIndent) {
		for (var i=0, c; (c=inComponents[i]); i++) {
			this.createEntry(c, inIndent);
			if(c.components) {
				this._visualize(c.components, inIndent + this.indent);
			}
		}
	},
	//* Unhighlight existing selection and set _this.selection_ to _inComponent_
	select: function(inComponent) {
		if(this.selection) {
			this.unHighlightItem(this.selection);
		}
		
		this.selection = inComponent;
		this.highlightDragItem(this.selection);
	},
	//* Select control with _comp.id_ that matches _inComponent_
	setSelected: function(inComponent) {
		for(var i=0, c;(c=this.getClientControls()[i]);i++) {
			if(c.comp.id === inComponent.id) {
				this.select(c);
				return;
			}
		}
	},
	
	//* Item events
	itemDown: function(inSender, inEvent) {
		this.doSelect({component: inSender.comp});
	},
	itemDragstart: function(inSender, inEvent) {
		if(!inEvent.dataTransfer) {
			return true;
		}
		
		inEvent.dataTransfer.setData("Text", enyo.json.codify.to(inSender.comp));
		return true;
	},
	itemDragover: function(inSender, inEvent) {
		if(!inEvent.dataTransfer) {
			return false;
		}
		
		// If sender is not a valid drop target, set _this.currentDropTarget_ to null (so highlighting still works properly)
		if(!this.isValidDropTarget(inSender)) {
			this.currentDropTarget = null;
			this.doUnHighlightDropTargets();
			return false;
		}
		
		inEvent.preventDefault();
		
		// If dragging on current drop target, do nothing (redundant)
		if(this.currentDropTarget && this.currentDropTarget === inSender) {
			return true;
		}
		
		this.currentDropTarget = inSender;
		
		this.highlightDropTarget(this.currentDropTarget);
		this.doHighlightDropTarget({component: this.currentDropTarget.comp});
		
		return true;
	},
	itemDragleave: function(inSender, inEvent) {
		if(!inEvent.dataTransfer || inSender === this.selection) {
			return true;
		}
		
		this.unHighlightItem(inSender);
		return true;
	},
	itemDrop: function(inSender, inEvent) {
		if(!inEvent.dataTransfer) {
			return true;
		}
		
		var dropData = enyo.json.codify.from(inEvent.dataTransfer.getData("Text")),
			targetId = inSender.comp.id;
		
		if(dropData.op && dropData.op === "newControl") {
			this.doPaletteDrop(enyo.mixin(dropData, {target: targetId}));
		} else {
			this.doDrop({
				item:   dropData.id,
				target: targetId
			});
		}
		
		return true;
	},
	
	isValidDropTarget: function(inComponent) {
		// TODO - descendents are not valid targets for their parents (currently this is validated by the iframe)
		return inComponent !== this.selection && inComponent.getAttribute("dropTarget") === "true";
	},
	//* Save _inData_ as _this.containerData_ to use as a reference when creating drop targets.
	setContainerData: function(inData) {
		this.containerData = inData;
		this.sendMessage({op: "state", val: "ready"});
	},
	
	highlightDropTarget: function(inComponent) {
		if(typeof inComponent.origBackground === "undefined") {
			inComponent.origBackground = inComponent.domStyles.background || null;
			inComponent.applyStyle("background","#cedafe");
		}
	},
	highlightDragItem: function(inComponent) {
		if(typeof inComponent.origBackground === "undefined") {
			inComponent.origBackground = inComponent.domStyles.background || null;
			inComponent.applyStyle("background","orange");
		}
	},
	unHighlightItem: function(inComponent) {
		if(typeof inComponent.origBackground !== "undefined") {
			inComponent.applyStyle("background", inComponent.origBackground);
			inComponent.origBackground = undefined;
		}
	},
	syncDropTargetHighlighting: function(inComponent) {
		var id = inComponent ? inComponent.id : null;
		
		for(var i=0, c;(c=this.getClientControls()[i]);i++) {
			if(c.comp.id === id) {
				this.highlightDropTarget(c);
			} else if(c !== this.selection) {
				this.unHighlightItem(c);
			}
		}
	}
});
