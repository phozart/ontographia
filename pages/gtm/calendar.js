// pages/gtm/calendar.js
// Redirect to unified GTM Studio route

export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/app/spaces/gtm/launch',
      permanent: true,
    },
  };
}

export default function Redirect() {
  return null;
}
