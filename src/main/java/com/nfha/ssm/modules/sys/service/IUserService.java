package com.nfha.ssm.modules.sys.service;

import com.nfha.ssm.modules.sys.entity.User;

import java.util.List;

/**
 * Created by Administrator on 2017/3/5.
 */
public interface IUserService {

	public List<User> getUserAll();

	public User getUserById(int userId);

}
