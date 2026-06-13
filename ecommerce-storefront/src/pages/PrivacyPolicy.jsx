import React from 'react';
import { Link } from 'react-router-dom';
import PageMeta from '../components/PageMeta';
import './LegalPage.css';

function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <PageMeta
        title="Privacy Policy"
        description="Learn how we collect, use, and protect your personal information."
        path="/privacy"
      />
      <div className="container">
        <article className="legal-content">
          <h1>Privacy Policy</h1>
          <p className="legal-updated">Last updated: June 2026</p>

          <p>
            We respect your privacy and are committed to protecting your personal data.
            This policy explains what information we collect, how we use it, and your rights.
          </p>

          <h2>Information we collect</h2>
          <p>When you use our store, we may collect:</p>
          <ul>
            <li>Account details (name, email, phone, delivery address)</li>
            <li>Order history and payment status (cash on delivery)</li>
            <li>Communications you send via our contact form</li>
            <li>Technical data such as browser type and device information</li>
          </ul>

          <h2>How we use your information</h2>
          <ul>
            <li>Process and deliver your orders</li>
            <li>Send order confirmations and account-related emails</li>
            <li>Respond to support requests</li>
            <li>Improve our website and customer experience</li>
            <li>Prevent fraud and protect our services</li>
          </ul>

          <h2>Data sharing</h2>
          <p>
            We do not sell your personal information. We may share data with service providers
            who help us operate the store (e.g. email delivery), only as needed to provide our services.
          </p>

          <h2>Data retention</h2>
          <p>
            We keep your information for as long as your account is active or as needed to fulfill orders
            and comply with legal obligations.
          </p>

          <h2>Your rights</h2>
          <p>
            You may request access, correction, or deletion of your personal data by contacting us.
            You can also update your account details from your profile after signing in.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy-related questions, please use our <Link to="/contact">contact page</Link>.
          </p>
        </article>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
