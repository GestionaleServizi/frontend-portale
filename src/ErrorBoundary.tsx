import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <h2>⚠️ Errore di applicazione</h2>
          <p>
            Qualcosa è andato storto. Torna alla{" "}
            <a href="/" style={{ color: "blue", textDecoration: "underline" }}>
              home
            </a>.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
