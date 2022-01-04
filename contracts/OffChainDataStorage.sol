pragma solidity ^0.5.0;

contract OffChainDataStorage
{
	struct OffChainDataStruct
	{
		bool isEntity;
	}

	mapping(address => OffChainDataStruct) public offchaindataStructs;
	address[] public entityList;

	event UserCreated
	(
	   address entityAddress,
	   bool isEntity
	);

	event UserDeleted
	(
	   address entityAddress,
	   bool isEntity
	);

	function isEntity(address entityAddress) public view returns(bool isExist)
	{
		return offchaindataStructs[entityAddress].isEntity;
	}

	function getEntityCount() public view returns(uint entityCount)
	{
		return entityList.length;
	}

	function createUser(address entityAddress) public
	{
		if(isEntity(entityAddress))
		{
			revert();
		}

		offchaindataStructs[entityAddress].isEntity = true;
		entityList.push(entityAddress) - 1;
		emit UserCreated(entityAddress, offchaindataStructs[entityAddress].isEntity);

	}	

	function deleteUser(address entityAddress) public
	{
		OffChainDataStruct memory _OffChainDataStruct = offchaindataStructs[entityAddress];
		_OffChainDataStruct.isEntity = !_OffChainDataStruct.isEntity;
		offchaindataStructs[entityAddress] = _OffChainDataStruct;
		emit UserDeleted(entityAddress,_OffChainDataStruct.isEntity);

	}

	function getUsers() view public returns(address []memory)
	{
		return entityList;
	}

	function getUserDetails(address _address) view public returns(address,bool)
	{
		return(_address,offchaindataStructs[_address].isEntity);
	}
}