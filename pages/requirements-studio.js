// Legacy redirect: /requirements-studio -> /app/spaces/analysis/repository
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/app/spaces/analysis/repository',
      permanent: true,
    },
  };
}

export default function Redirect() {
  return null;
}
