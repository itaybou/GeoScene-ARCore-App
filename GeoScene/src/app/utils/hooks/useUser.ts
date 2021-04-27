import { UserContext } from './../../providers/UserProvider';
import { useContext } from 'react';

const useUser = () => {
  const user = useContext(UserContext);
  return user;
};

export default useUser;
