// Legacy redirect: /learning-studio -> /app/spaces/als/sessions
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/app/spaces/als/sessions',
      permanent: true,
    },
  };
}

export default function Redirect() {
  return null;
}
