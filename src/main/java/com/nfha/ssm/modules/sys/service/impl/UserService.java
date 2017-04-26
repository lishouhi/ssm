package com.nfha.ssm.modules.sys.service.impl;

import com.nfha.ssm.modules.sys.dao.UserMapper;
import com.nfha.ssm.modules.sys.entity.User;
import com.nfha.ssm.modules.sys.service.IUserService;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * Created by Administrator on 2017/3/5.
 */
@Service("userService")
public class UserService implements IUserService{

	@Resource
	public UserMapper userDao;

	public List<User> getUserAll()
	{
		return this.userDao.selectAll();
	}

	public User getUserById(int userId) {
		return this.userDao.selectByPrimaryKey(userId);
	}
}
