import { Component, type ReactNode } from "react";
import type { Store } from "../app/store";
import { t } from "../i18n/t";

interface Props {
  store: Store;
  children: ReactNode;
}

/** A screen that fails to draw offers a way out instead of a blank page, which a saved game would repeat. */
export class Rescue extends Component<Props, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const startOver = () => {
      this.props.store.reset();
      this.setState({ failed: false });
    };
    return (
      <main className="screen">
        <section className="paper">
          <h2>{t("rescue.title")}</h2>
          <p>{t("rescue.text")}</p>
        </section>
        <div className="actions">
          <button type="button" className="btn primary" onClick={() => window.location.reload()}>
            {t("rescue.reload")}
          </button>
          <button type="button" className="btn secondary" onClick={startOver}>
            {t("rescue.startOver")}
            <small>{t("rescue.startOver.sub")}</small>
          </button>
        </div>
      </main>
    );
  }
}
