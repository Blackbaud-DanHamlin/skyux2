import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import {
  SkyTextExpandRepeaterAdapterService
} from './text-expand-repeater-adapter.service';
import {
  SkyResourcesService
} from '../resources';
@Component({
  selector: 'sky-text-expand-repeater',
  templateUrl: './text-expand-repeater.component.html',
  styleUrls: ['./text-expand-repeater.component.scss'],
  providers: [
    SkyTextExpandRepeaterAdapterService,
    SkyResourcesService
  ]
})
export class SkyTextExpandRepeaterComponent implements AfterViewInit {
  @Input()
  public maxItems: number;
  @Input()
  public set data(value: Array<any>) {
    this.setup(value);
  }
  public buttonText: string;
  private _data: Array<any>;
  private seeMoreText: string = this.resources.getString('text_expand_see_more');
  private seeLessText: string = this.resources.getString('text_expand_see_less');
  private isExpanded: boolean = false;
  private expandable: boolean;
  @ViewChild('container')
  private containerEl: ElementRef;
  private items: Array<HTMLElement>;

  constructor(private resources: SkyResourcesService, private elRef: ElementRef,
    private textExpandRepeaterAdapter: SkyTextExpandRepeaterAdapterService) { }

  public ngAfterViewInit() {
    if (this._data) {
      this.items = this.textExpandRepeaterAdapter.getItems(this.elRef);
      for (let i = this.maxItems; i < this._data.length; i++) {
        this.textExpandRepeaterAdapter.hideItem(this.items[i]);
      }
    }
  }

  public animationEnd() {
    // Ensure the correct items are displayed
    if (!this.isExpanded) {
      for (let i = this.maxItems; i < this._data.length; i++) {
        this.textExpandRepeaterAdapter.hideItem(this.items[i]);
      }
    }
    // Set height back to auto so the browser can change the height as needed with window changes
    this.textExpandRepeaterAdapter.setContainerHeight(this.containerEl, 'auto');
  }

  public repeaterExpand() {
    let adapter = this.textExpandRepeaterAdapter;
    let container = this.containerEl;
    let currentHeight = adapter.getContainerHeight(container);
    for (let i = this.maxItems; i < this._data.length; i++) {
      if (this.isExpanded) {
        adapter.hideItem(this.items[i]);
      } else {
        adapter.showItem(this.items[i]);
      }
    }
    let newHeight = adapter.getContainerHeight(container);
    if (this.isExpanded) {
      this.buttonText = this.seeMoreText;
    } else {
      this.buttonText = this.seeLessText;
    }
    if (newHeight < currentHeight) {
      // The new text is smaller than the old text, so put the old text back before doing
      // the collapse animation to avoid showing a big chunk of whitespace.
      for (let i = this.maxItems; i < this._data.length; i++) {
        adapter.showItem(this.items[i]);
      }
    }
    adapter.setContainerHeight(container, `${currentHeight}px`);
    // This timeout is necessary due to the browser needing to pick up the non-auto height being set
    // in order to do the transtion in height correctly. Without it the transition does not fire.
    setTimeout(function () {
      adapter.setContainerHeight(container, `${newHeight}px`);
    }, 5);
    this.isExpanded = !this.isExpanded;
  }

  private setup(value: Array<any>) {
    if (value) {
      let length = value.length;
      if (length > this.maxItems) {
        this.expandable = true;
        this.buttonText = this.seeMoreText;
        this.isExpanded = false;
      } else {
        this.expandable = false;
      }
      this._data = value;
    }
  }
}
