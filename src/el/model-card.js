
import { LitElement, html, css, nothing } from 'lit';
import { SignalWatcher } from '@lit-labs/signals';
import "@supramundane/ui/button";
import "@supramundane/ui/icon-button";
import "@supramundane/ui/icon";
import { fileEarmarkPlusFill, fileMedicalFill, check, x } from '@supramundane/ui/icons';
import { createTileFromModel, removeModel } from '../state.js';

class ModelCard extends SignalWatcher(LitElement) {
  static properties = {
    model: { state: true },
    confirming: { state: true },
  };
  static styles = css`
    :host {
      display: block;
    }
    .model {
      display: grid;
      position: relative;
      grid-template-areas:
        "icon name"
        "icon id"
        "icon desc"
        "icon action"
      ;
      grid-template-columns: 2rem auto;
      gap: var(--sm-spacing-3x-small) var(--sm-spacing-small);
      align-items: start;
      padding: var(--sm-spacing-x-small) var(--sm-spacing-small);
      border-radius: var(--sm-border-radius-small);
      transition: background-color var(--sm-transition-fast);
    }
    .model:hover,
    .model:focus-within {
      background-color: var(--sm-color-accent-50);
    }
    /* icon sits in an accent chip so the card reads at a glance */
    .icon {
      grid-area: icon;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      font-size: 1.1rem;
      line-height: 1;
      color: var(--sm-color-accent-700);
      background-color: var(--sm-color-accent-100);
      border-radius: var(--sm-border-radius-medium);
    }
    .icon img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: inherit;
    }
    .name {
      grid-area: name;
      font-weight: var(--sm-font-weight-semibold);
      color: var(--sm-color-neutral-900);
      /* leave room for the top-right trash affordance */
      padding-right: 1.75rem;
    }
    .id {
      grid-area: id;
      font-family: var(--sm-font-mono);
      font-size: var(--sm-font-size-x-small);
      color: var(--sm-color-accent-600);
      word-break: break-all;
    }
    .desc {
      grid-area: desc;
      font-size: var(--sm-font-size-small);
      color: var(--sm-color-neutral-700);
    }
    /* New + Trash only surface while the card is hovered or keyboard-focused */
    .new {
      grid-area: action;
      margin-top: var(--sm-spacing-2x-small);
      justify-self: end;
    }
    .delete {
      position: absolute;
      /* float the remove button off the top-right corner */
      top: calc(-1 * var(--sm-spacing-x-small));
      right: calc(-1 * var(--sm-spacing-x-small));
    }
    .new,
    .delete {
      opacity: 0;
      visibility: hidden;
      transition: opacity var(--sm-transition-fast), visibility var(--sm-transition-fast);
    }
    .model:hover .new,
    .model:focus-within .new,
    .model:hover .delete,
    .model:focus-within .delete {
      opacity: 1;
      visibility: visible;
    }
    .confirm {
      position: absolute;
      /* same spot the remove x floats from */
      top: calc(-1 * var(--sm-spacing-x-small));
      right: calc(-1 * var(--sm-spacing-x-small));
      display: flex;
      align-items: center;
      gap: var(--sm-spacing-2x-small);
      padding: var(--sm-spacing-3x-small) var(--sm-spacing-x-small);
      background-color: var(--sm-color-neutral-0);
      border: 1px solid var(--sm-color-danger-200);
      border-radius: var(--sm-border-radius-pill);
      box-shadow: var(--sm-shadow-small);
    }
    .confirm-label {
      font-size: var(--sm-font-size-x-small);
      font-weight: var(--sm-font-weight-medium);
      color: var(--sm-color-danger-700);
      white-space: nowrap;
    }
  `;

  #handleNew () {
    createTileFromModel(this.model?.id);
  }
  #handleTrash () {
    this.confirming = true;
  }
  #handleCancel () {
    this.confirming = false;
  }
  #handleConfirm () {
    removeModel(this.model?.id, true);
    this.confirming = false;
  }

  render() {
    const { id, url, masl } = this.model || {};
    if (!id) return nothing;
    const iconSrc = (masl.model.icons || masl.icons || [])[0]?.src;
    const icon = iconSrc
      ? html`<sm-icon><img src=${new URL(iconSrc, url).toString()}></sm-icon>`
      : fileMedicalFill()
    ;
    return html`
      <div class="model">
        <div class="icon">${icon}</div>
        <div class="name">${masl.model.name || masl.name || 'Unnamed'}</div>
        <div class="id">${id}</div>
        <div class="desc">${masl.model.description || masl.description}</div>
        <div class="new">
          <sm-button size="small" @click=${this.#handleNew}>
            ${fileEarmarkPlusFill({ slot: 'prefix' })} New
          </sm-button>
        </div>
        ${
          this.confirming
          ? html`
            <div class="confirm">
              <span class="confirm-label">Remove?</span>
              <sm-icon-button
                size="small"
                variant="danger"
                label="Confirm removal"
                @click=${this.#handleConfirm}
              >${check()}</sm-icon-button>
              <sm-icon-button
                size="small"
                label="Cancel"
                @click=${this.#handleCancel}
              >${x()}</sm-icon-button>
            </div>
          `
          : html`
            <sm-icon-button
              class="delete"
              size="small"
              label="Remove model"
              @click=${this.#handleTrash}
            >${x()}</sm-icon-button>
          `
        }
      </div>
    `;
  }
}

customElements.define('tnt-model-card', ModelCard);
