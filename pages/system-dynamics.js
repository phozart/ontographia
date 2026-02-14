// Legacy redirect: /system-dynamics -> /app/spaces/sd/canvas
export async function getServerSideProps() {
  return {
    redirect: {
      destination: '/app/spaces/sd/canvas',
      permanent: true,
    },
  };
}

export default function Redirect() {
  return null;
}
