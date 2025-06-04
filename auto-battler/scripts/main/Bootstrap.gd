extends Node

func _ready():
	print("Bootstrap loaded")
	get_node("/root/GameManager").start_run()
