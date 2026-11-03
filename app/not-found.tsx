import Link from 'next/link';
import './pages.css';

export default function NotFound() {
  return (
    <section className="plain">
      <p className="label pink">404</p>
      <h1 className="display">this page got a fringe it didn’t ask for.</h1>
      <p>it’s hiding under there somewhere. the lookbook isn’t.</p>
      <div className="row" style={{ marginTop: 24 }}>
        <Link className="pill hot" href="/#lookbook">open the lookbook</Link>
        <Link className="pill chrome" href="/">home</Link>
      </div>
    </section>
  );
}
