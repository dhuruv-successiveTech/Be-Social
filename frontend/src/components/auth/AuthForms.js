'use client';

import { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthForms = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  return isLogin ? (
    <LoginForm onToggleForm={toggleForm} />
  ) : (
    <RegisterForm onToggleForm={toggleForm} />
  );
};

export default AuthForms;
